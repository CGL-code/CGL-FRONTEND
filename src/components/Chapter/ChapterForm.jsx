/* The current active specimen for the modification _Now modified
 */

import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Input, Modal, Row, Select, Table, Tag, Typography, message } from "antd";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

const { Title, Text } = Typography;

const pad2 = (n) => String(n).padStart(2, "0");
const pad4 = (n) => String(n).padStart(4, "0");

/** Demo book list (replace with API later) */
const demoBooks = [
  {
    id: "b1",
    MB: 1,
    SB: 1,
    GP: 1,
    title: "Cosmic Game Logic — Book One",
    type: "Research",
    status: "Ready to Create",
    introduction: "A brief introduction…",
  },
  {
    id: "b2",
    MB: 1,
    SB: 2,
    GP: 1,
    title: "Cosmic Game Logic — Book Two",
    type: "Guide",
    status: "Under Review",
    introduction: "A brief introduction…",
  },
];

const DS_CODES = [
  { value: "BT", label: "BT — Book Title (system/locked after save)" },
  { value: "CT", label: "CT — Chapter Title (user; locked after chapter finalisation)" },
  { value: "X1", label: "X1 — Content Block 1" },
  { value: "X2", label: "X2 — Content Block 2" },
];

/**
 * TipTap editor wrapper
 * - Produces JSON via editor.getJSON()
 * - Uses placeholder
 */
function TipTapBox({ disabled, initialJson, onChangeJson }) {
  const editor = useEditor({
    editable: !disabled,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Type here… (TipTap JSON will be saved)",
      }),
    ],
    content: initialJson || { type: "doc", content: [{ type: "paragraph" }] },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChangeJson?.(json);
    },
  });

  useEffect(() => {
    if (!editor) return;
    // Keep user's active typing intact; no forced reset.
  }, [editor, initialJson]);

  return (
    <div
      className="cgl-editor-box"
      style={{
        border: "1px solid #d9d9d9",
        borderRadius: 8,
        padding: 12,
        minHeight: 220,
        background: disabled ? "#fafafa" : "#fff",
      }}
    >
      <EditorContent editor={editor} />
      <div style={{ marginTop: 8 }}>
        <Text type="secondary">Stored format: TipTap JSON (not HTML)</Text>
      </div>
    </div>
  );
}

export default function ChapterForm() {
  // Window 1 state
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterNo, setChapterNo] = useState(10); // default as per your document logic
  const [chapterStatus, setChapterStatus] = useState("Draft"); // Draft -> In Progress -> Finalised
  const [window1Locked, setWindow1Locked] = useState(false);

  // System assigned fields (Window 1)
  const sysFields = useMemo(() => {
    if (!selectedBook) return null;
    return {
      MB: selectedBook.MB,
      SB: selectedBook.SB,
      GP: selectedBook.GP,
      bookTitle: selectedBook.title,
      chapNo: chapterNo,
      // BT/CT special records (you can adjust numbering rules later)
      bt: { MRec: 10, SRec: 1, DSCode: "BT" },
      ct: { MRec: 10, SRec: 2, DSCode: "CT" },
    };
  }, [selectedBook, chapterNo]);

  // Window 2 state
  const [window2Enabled, setWindow2Enabled] = useState(false);
  const [activeDSCode, setActiveDSCode] = useState("X1");
  const [activeJson, setActiveJson] = useState({ type: "doc", content: [{ type: "paragraph" }] });

  // Next record assignment for Window 2
  const [nextMRec, setNextMRec] = useState(20);
  const [nextSRec, setNextSRec] = useState(1);

  // Chapter Data Table (review)
  const [cdtOpen, setCdtOpen] = useState(false);
  const [chapterDataRows, setChapterDataRows] = useState([]);

  // Book list table
  const bookColumns = [
    { title: "MB#", dataIndex: "MB", width: 70 },
    { title: "SB#", dataIndex: "SB", width: 70 },
    { title: "GP#", dataIndex: "GP", width: 70 },
    { title: "Title", dataIndex: "title" },
    { title: "Type", dataIndex: "type", width: 120 },
    {
      title: "Status",
      dataIndex: "status",
      width: 140,
      render: (v) => {
        const color = v === "Ready to Create" ? "green" : v === "Under Review" ? "orange" : "blue";
        return <Tag color={color}>{v}</Tag>;
      },
    },
    {
      title: "Select",
      key: "select",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => {
            setSelectedBook(record);
            setBookModalOpen(false);
            message.success("Book selected. Now enter Chapter Title and Save.");
          }}
        >
          Select
        </Button>
      ),
    },
  ];

  const chapterDataColumns = [
    { title: "MB#", dataIndex: "MB", width: 70 },
    { title: "SB#", dataIndex: "SB", width: 70 },
    { title: "GP#", dataIndex: "GP", width: 70 },
    { title: "Chap#", dataIndex: "ChapNo", width: 80 },
    { title: "MRec#", dataIndex: "MRec", width: 80 },
    { title: "SRec#", dataIndex: "SRec", width: 80 },
    { title: "DSCode", dataIndex: "DSCode", width: 90 },
    { title: "Record #", dataIndex: "RecordNo", width: 110 },
    {
      title: "Data (JSON preview)",
      dataIndex: "Json",
      render: (json) => (
        <pre style={{ maxWidth: 420, whiteSpace: "pre-wrap", margin: 0 }}>
          {JSON.stringify(json, null, 2)}
        </pre>
      ),
    },
  ];

  function buildRecordNo(mRec, sRec) {
    return `${pad4(mRec)}-${pad2(sRec)}`;
  }

  function handleSaveWindow1() {
    if (!selectedBook) {
      message.error("Please select a book first (Popup List of All Books).");
      return;
    }
    if (!chapterTitle.trim()) {
      message.error("Please enter Chapter Title.");
      return;
    }

    // Lock window 1, set status, enable window 2
    setWindow1Locked(true);
    setWindow2Enabled(true);
    setChapterStatus("In Progress");

    // Add BT & CT rows into Chapter Data Table (optional but helpful)
    const BTrow = {
      key: `BT-${Date.now()}`,
      MB: sysFields.MB,
      SB: sysFields.SB,
      GP: sysFields.GP,
      ChapNo: sysFields.chapNo,
      MRec: sysFields.bt.MRec,
      SRec: sysFields.bt.SRec,
      DSCode: "BT",
      RecordNo: buildRecordNo(sysFields.bt.MRec, sysFields.bt.SRec),
      Json: { type: "text", value: sysFields.bookTitle },
    };

    const CTrow = {
      key: `CT-${Date.now() + 1}`,
      MB: sysFields.MB,
      SB: sysFields.SB,
      GP: sysFields.GP,
      ChapNo: sysFields.chapNo,
      MRec: sysFields.ct.MRec,
      SRec: sysFields.ct.SRec,
      DSCode: "CT",
      RecordNo: buildRecordNo(sysFields.ct.MRec, sysFields.ct.SRec),
      Json: { type: "text", value: chapterTitle.trim() },
    };

    setChapterDataRows((prev) => [BTrow, CTrow, ...prev]);

    message.success("Window 1 saved. Window 2 enabled (DSCode + TipTap).");
  }

  function handleSaveCreateNext() {
    if (!window2Enabled || !window1Locked) {
      message.error("Please complete Window 1 first (Save the above).");
      return;
    }
    if (!activeDSCode) {
      message.error("Please select DSCode.");
      return;
    }
    if (!selectedBook) {
      message.error("No book selected.");
      return;
    }

    // Disallow BT/CT creation in Window 2 (handled in Window 1)
    if (activeDSCode === "BT" || activeDSCode === "CT") {
      message.warning("BT/CT are created in Window 1. Please choose another DSCode.");
      return;
    }

    const row = {
      key: `${activeDSCode}-${Date.now()}`,
      MB: selectedBook.MB,
      SB: selectedBook.SB,
      GP: selectedBook.GP,
      ChapNo: chapterNo,
      MRec: nextMRec,
      SRec: nextSRec,
      DSCode: activeDSCode,
      RecordNo: buildRecordNo(nextMRec, nextSRec),
      Json: activeJson,
    };

    setChapterDataRows((prev) => [row, ...prev]);

    // Next numbering (simple rule for now)
    setNextMRec((m) => m + 10);
    setNextSRec(1);

    setActiveJson({ type: "doc", content: [{ type: "paragraph" }] });
    setCdtOpen(true);

    message.success("Saved current DSCode content and created next slot.");
  }

  return (
    <div className="chapter-print-root" style={{ padding: 16 }}>
      {/* Print rules live INSIDE this component so you don’t have to edit other files */}
      <style>{`
        @media print {
          /* Make sure the full page prints (not a “scrollable area only”) */
          html, body {
            height: auto !important;
            overflow: visible !important;
          }

          /* Hide modals during print (they can mess printing) */
          .ant-modal-root {
            display: none !important;
          }

          /* Remove shadows for clean printing */
          .ant-card {
            box-shadow: none !important;
          }

          /* IMPORTANT: allow long cards to break across pages */
          .ant-card, .ant-card-body, .ant-row, .ant-col {
            break-inside: auto !important;
            page-break-inside: auto !important;
          }

          /* Give cards breathing room between pages */
          .print-card {
            margin-bottom: 16px !important;
          }

          /* TipTap area should show border nicely in print */
          .cgl-editor-box {
            border: 1px solid #999 !important;
          }
        }
      `}</style>

      <Title level={3} style={{ marginTop: 0 }}>
        Chapter UI (One Column) — Window 1 then Window 2
      </Title>

      {/* ONE COLUMN LAYOUT: Window 1 then Window 2 */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            className="print-card"
            title="Window 1 — Identity & Control"
            extra={<Tag color={window1Locked ? "green" : "blue"}>{window1Locked ? "Locked" : "Editable"}</Tag>}
            style={{ borderRadius: 12 }}
          >
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <Button type="default" onClick={() => setBookModalOpen(true)} disabled={window1Locked}>
                Popup List of All Books with Chapter
              </Button>

              <Button type="primary" onClick={handleSaveWindow1} disabled={window1Locked}>
                Save the above
              </Button>

              <Button onClick={() => setCdtOpen(true)} disabled={!selectedBook}>
                Popup Chapter Data Table
              </Button>
            </div>

            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Text type="secondary">Status</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag color={chapterStatus === "In Progress" ? "orange" : chapterStatus === "Finalised" ? "green" : "blue"}>
                    {chapterStatus}
                  </Tag>
                </div>
              </Col>

              <Col xs={24} sm={12}>
                <Text type="secondary">Chap# (default 10)</Text>
                <div style={{ marginTop: 4 }}>
                  <Input value={chapterNo} disabled />
                </div>
              </Col>
            </Row>

            <div style={{ marginTop: 12 }}>
              <Text type="secondary">Book Title (from Book List)</Text>
              <Input value={selectedBook?.title || ""} placeholder="Select a book…" disabled />
            </div>

            <div style={{ marginTop: 12 }}>
              <Text type="secondary">Chapter Title (User must enter)</Text>
              <Input
                value={chapterTitle}
                placeholder="Enter Chapter Title"
                onChange={(e) => setChapterTitle(e.target.value)}
                disabled={window1Locked}
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <Title level={5} style={{ marginBottom: 8 }}>
                System Assigned Fields (Auto)
              </Title>

              <Row gutter={12}>
                <Col xs={24} sm={8}>
                  <Text type="secondary">MB#</Text>
                  <Input value={sysFields?.MB ?? ""} disabled />
                </Col>
                <Col xs={24} sm={8}>
                  <Text type="secondary">SB#</Text>
                  <Input value={sysFields?.SB ?? ""} disabled />
                </Col>
                <Col xs={24} sm={8}>
                  <Text type="secondary">GP#</Text>
                  <Input value={sysFields?.GP ?? ""} disabled />
                </Col>
              </Row>

              <div style={{ marginTop: 12 }}>
                <Text type="secondary">BT/CT Special Records</Text>
                <Table
                  size="small"
                  pagination={false}
                  style={{ marginTop: 8 }}
                  dataSource={
                    sysFields
                      ? [
                          {
                            key: "bt",
                            label: "BT (Book Title)",
                            MRec: pad4(sysFields.bt.MRec),
                            SRec: pad2(sysFields.bt.SRec),
                            DSCode: sysFields.bt.DSCode,
                          },
                          {
                            key: "ct",
                            label: "CT (Chapter Title)",
                            MRec: pad4(sysFields.ct.MRec),
                            SRec: pad2(sysFields.ct.SRec),
                            DSCode: sysFields.ct.DSCode,
                          },
                        ]
                      : []
                  }
                  columns={[
                    { title: "Item", dataIndex: "label" },
                    { title: "MRec#", dataIndex: "MRec", width: 90 },
                    { title: "SRec#", dataIndex: "SRec", width: 90 },
                    { title: "DSCode", dataIndex: "DSCode", width: 90 },
                  ]}
                />
              </div>
            </div>
          </Card>
        </Col>

        <Col span={24}>
          <Card
            className="print-card"
            title="Window 2 — Content Creation (DSCode + TipTap)"
            extra={<Tag color={window2Enabled ? "green" : "red"}>{window2Enabled ? "Enabled" : "Disabled"}</Tag>}
            style={{ borderRadius: 12 }}
          >
            <Row gutter={12} style={{ marginBottom: 12 }}>
              <Col xs={24} sm={12}>
                <Text type="secondary">DSCode</Text>
                <Select
                  style={{ width: "100%", marginTop: 4 }}
                  options={DS_CODES}
                  value={activeDSCode}
                  onChange={setActiveDSCode}
                  disabled={!window2Enabled}
                />
              </Col>

              <Col xs={12} sm={6}>
                <Text type="secondary">MRec#</Text>
                <Input style={{ marginTop: 4 }} value={pad4(nextMRec)} disabled />
              </Col>

              <Col xs={12} sm={6}>
                <Text type="secondary">SRec#</Text>
                <Input style={{ marginTop: 4 }} value={pad2(nextSRec)} disabled />
              </Col>
            </Row>

            <TipTapBox disabled={!window2Enabled} initialJson={activeJson} onChangeJson={setActiveJson} />

            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <Button type="primary" onClick={handleSaveCreateNext} disabled={!window2Enabled}>
                Save &amp; Create Next
              </Button>

              <Button onClick={() => setCdtOpen(true)} disabled={!selectedBook}>
                Popup Current Chapter (CDT)
              </Button>
            </div>

            <div style={{ marginTop: 12 }}>
              <Text type="secondary">Note: Reference UI. Dev guy will connect DB/API and final styling.</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* BOOK LIST MODAL */}
      <Modal
        title="Popup List of All Books (Select a Book)"
        open={bookModalOpen}
        onCancel={() => setBookModalOpen(false)}
        footer={null}
        width={980}
      >
        <Table rowKey="id" columns={bookColumns} dataSource={demoBooks} pagination={{ pageSize: 5 }} />
      </Modal>

      {/* CHAPTER DATA TABLE MODAL */}
      <Modal
        title="Chapter Data Table (Read-only Review)"
        open={cdtOpen}
        onCancel={() => setCdtOpen(false)}
        footer={[
          <Button key="close" onClick={() => setCdtOpen(false)}>
            Close
          </Button>,
        ]}
        width={1100}
      >
        <Table rowKey="key" columns={chapterDataColumns} dataSource={chapterDataRows} pagination={{ pageSize: 5 }} />
      </Modal>
    </div>
  );
}
