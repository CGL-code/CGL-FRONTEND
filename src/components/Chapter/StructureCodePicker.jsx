import React, { useEffect, useMemo, useState } from "react";
import { Modal, Table, Radio, Tooltip, Typography } from "antd";
import codes from "../../config/MasterStructureCodes.json";

const { Text } = Typography;

export default function StructureCodePicker({ open, onClose, value, onSelect }) {
  const [selected, setSelected] = useState(value || null);

  // ✅ IMPORTANT: keep picker selection synced with parent value
  useEffect(() => {
    setSelected(value || null);
  }, [value, open]);

  const rows = useMemo(() => {
    const sorted = [...codes].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
    return sorted.map((c, idx) => ({ key: `${c.code}-${idx}`, ...c }));
  }, []);

  const selectedObj = useMemo(() => rows.find((r) => r.code === selected), [rows, selected]);

  const columns = [
    {
      title: "",
      dataIndex: "code",
      width: 60,
      render: (_, record) => (
        <Radio checked={selected === record.code} onChange={() => setSelected(record.code)} />
      ),
    },
    {
      title: "Code",
      dataIndex: "code",
      width: 90,
      render: (code) => <Text strong style={{ fontFamily: "monospace" }}>{code}</Text>,
    },
    {
      title: "Label",
      dataIndex: "label",
      width: 220,
      render: (label) => <span>{label || ""}</span>,
    },
    {
      title: "Description",
      dataIndex: "desc",
      render: (desc) => {
        const safe = desc || "";
        return safe ? (
          <Tooltip title={safe}>
            <span style={{ cursor: "help" }}>{safe}</span>
          </Tooltip>
        ) : (
          <span style={{ color: "rgba(0,0,0,0.35)" }}>—</span>
        );
      },
    },
  ];

  return (
    <Modal
      title="Structure Codes"
      open={open}
      onCancel={onClose}
      okText="Use Selected"
      onOk={() => {
        if (selectedObj) onSelect(selectedObj);
        onClose();
      }}
    >
      <Table
        columns={columns}
        dataSource={rows}
        pagination={false}
        size="small"
        scroll={{ y: 320 }}
      />

      <div style={{ marginTop: 10 }}>
        <Text type="secondary">
          Selected:{" "}
          {selectedObj
            ? `${selectedObj.code} — ${selectedObj.label || ""} — ${selectedObj.desc || ""}`
            : "None"}
        </Text>
      </div>
    </Modal>
  );
}
