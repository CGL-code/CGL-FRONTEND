import React, { useEffect, useMemo, useState } from "react";
import { Select, Input, Button, Table, Space, Typography, message } from "antd";
import axios from "axios";

const { Title } = Typography;

export default function DsCodeSelector() {
  const [opts, setOpts] = useState({
    semanticPurposes: [],
    semantics: [],
    dscodes: []
  });

  const [semanticPurposeId, setSemanticPurposeId] = useState(null);
  const [semanticId, setSemanticId] = useState(null);
  const [dscodeId, setDscodeId] = useState(null);
  const [text, setText] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios
      .get("/api/dscode/options")
      .then((res) => setOpts(res.data.options))
      .catch(() => message.error("Failed to load DSCode options"));
  }, []);

  const semanticOptions = useMemo(() => {
    return semanticPurposeId
      ? opts.semantics.filter((s) => s.purposeId === semanticPurposeId)
      : [];
  }, [opts.semantics, semanticPurposeId]);

  const dscodeOptions = useMemo(() => {
    return semanticId
      ? opts.dscodes.filter((d) => d.semanticId === semanticId)
      : [];
  }, [opts.dscodes, semanticId]);

  const onPurposeChange = (value) => {
    setSemanticPurposeId(value);
    setSemanticId(null);
    setDscodeId(null);
  };

  const onSemanticChange = (value) => {
    setSemanticId(value);
    setDscodeId(null);
  };

  const onSave = () => {
    if (!semanticPurposeId || !semanticId || !dscodeId || !text.trim()) {
      return message.warning("Please complete all selections and text.");
    }

    setRows((prev) => [
      {
        key: Date.now(),
        semanticPurposeId,
        semanticId,
        dscodeId,
        text: text.trim()
      },
      ...prev
    ]);

    setText("");
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <Title level={4}>DSCode Tagging – Part 1</Title>

      <Space direction="vertical" style={{ width: "100%" }}>
        <Select
          placeholder="— Select Semantic Purpose —"
          options={opts.semanticPurposes.map((x) => ({ value: x.id, label: x.label }))}
          onChange={onPurposeChange}
          value={semanticPurposeId}
          allowClear
        />

        <Select
          placeholder="— Select Semantic —"
          options={semanticOptions.map((x) => ({ value: x.id, label: x.label }))}
          onChange={onSemanticChange}
          value={semanticId}
          disabled={!semanticPurposeId}
          allowClear
        />

        <Select
          placeholder="— Select DSCode —"
          options={dscodeOptions.map((x) => ({ value: x.id, label: x.label }))}
          onChange={setDscodeId}
          value={dscodeId}
          disabled={!semanticId}
          allowClear
        />

        <Input.TextArea
          placeholder="Enter text to tag with DSCode"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <Button type="primary" onClick={onSave}>
          Save Tag
        </Button>

        <Table
          dataSource={rows}
          columns={[
            { title: "Purpose", dataIndex: "semanticPurposeId" },
            { title: "Semantic", dataIndex: "semanticId" },
            { title: "DSCode", dataIndex: "dscodeId" },
            { title: "Text", dataIndex: "text" }
          ]}
          pagination={{ pageSize: 5 }}
        />
      </Space>
    </div>
  );
}
