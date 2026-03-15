import { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  Typography,
  message,
  Divider,
  Modal,
  Table,
} from "antd";

import {
  saveInsertPlanApi,
  saveBookApi,
  getNextRegularApi,
  listBooksApi,
} from "../../services/api";

const { Title, Text, Paragraph } = Typography;

export default function BookForm() {
  const [form] = Form.useForm();

  // const [entryMode, setEntryMode] = useState("regular");
  const [entryMode, setEntryMode] = useState(null);

  const [savingInsertPlan, setSavingInsertPlan] = useState(false);
  const [savingBook, setSavingBook] = useState(false);
  const [introModalVisible, setIntroModalVisible] = useState(false);
  const [selectedIntro, setSelectedIntro] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [booksList, setBooksList] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [insertCalculated, setInsertCalculated] = useState(false);

  const formatMBook = (num) => (num !== undefined ? String(num).padStart(4, "0") : "");
  const formatSBook = (num) => (num !== undefined ? String(num).padStart(2, "0") : "");


  // const isInsertMode = entryMode === "insert";


  useEffect(() => {
    if (entryMode === "regular") {
      getNextRegularApi().then((res) => {
        form.setFieldsValue({
          mBookNo: res.data.mBookNo,
          sBookNo: res.data.sBookNo,
        });
      });
    }

    if (entryMode === "insert") {
      form.setFieldsValue({
        mBookNo: undefined,
        sBookNo: undefined,
      });
    }
  }, [entryMode, form]);



  /* ===============================
     ENTRY MODE CHANGE
     =============================== */
  const handleEntryModeChange = (e) => {
    const mode = e.target.value;
    setEntryMode(mode);

    if (mode === "regular") {
      form.resetFields([
        "refMBookNo",
        "refSBookNo",
        "existingBookTitle",
        "newBookTitle",
        "insertReason",
      ]);
    }
  };

  /* ===============================
     SAVE 01 – INSERT PLAN
     =============================== */
  const handleSaveInsertPlan = async () => {
    try {
      const values = await form.validateFields([
        "refMBookNo",
        "refSBookNo",
        "newBookTitle",
      ]);

      setSavingInsertPlan(true);

      const res = await saveInsertPlanApi({
        refMBookNo: values.refMBookNo,
        refSBookNo: values.refSBookNo,
        title: values.newBookTitle,
        reason: form.getFieldValue("insertReason"),
      });

      form.setFieldsValue({
        newMBookNo: res.data.mBookNo,
        newSBookNo: res.data.sBookNo,
        newBookGroupNo: res.data.bookGroupNo,
        newSection: res.data.section,
      });

      setInsertCalculated(true);  // ✅ IMPORTANT

      message.success("Insert location calculated successfully.");
    } catch {
      message.error("Insert calculation failed.");
    } finally {
      setSavingInsertPlan(false);
    }
  };


  const handleSaveInsertedBook = async () => {
    if (!insertCalculated) {
      message.error("Please calculate insert location first.");
      return;
    }

    try {
      const values = await form.validateFields([
        "newBookTitle",
        "introParas",
      ]);

      setSavingBook(true);

      await saveBookApi({
        typeOfEntry: "deliberate",
        mBookNo: form.getFieldValue("newMBookNo"),
        sBookNo: form.getFieldValue("newSBookNo"),
        bookGroupNo: form.getFieldValue("newBookGroupNo"),
        section: form.getFieldValue("newSection"),
        title: values.newBookTitle,
        introParas: values.introParas,
      });

      message.success("Inserted book saved successfully.");

      form.resetFields();
      setInsertCalculated(false);
      setEntryMode(null);

    } catch {
      message.error("Save failed.");
    } finally {
      setSavingBook(false);
    }
  };



  /* ===============================
     SAVE 02 – FINAL BOOK
     =============================== */
  const handleSaveBook = async () => {
    try {
      const values = await form.validateFields([
        "mBookNo",
        "sBookNo",
        "bookGroupNo",
        "section",
        "bookTitle",
        "introParas",
      ]);

      setSavingBook(true);

      await saveBookApi({
        typeOfEntry: entryMode === "insert" ? "deliberate" : "regular",
        mBookNo: values.mBookNo,
        sBookNo: values.sBookNo,
        bookGroupNo: values.bookGroupNo,
        section: values.section,
        title: values.bookTitle,
        introParas: values.introParas,
      });

      message.success("Book saved successfully.");
      form.resetFields();
      setEntryMode("regular");
    } catch (err) {
      message.error(err.response?.data?.error || "Save failed.");
    } finally {
      setSavingBook(false);
    }
  };

  /* ===============================
     LOAD BOOK LIST
     =============================== */
  const handleViewBooks = async () => {
    setModalVisible(true);
    setLoadingBooks(true);
    try {
      const res = await listBooksApi();
      setBooksList(res.data);
    } catch {
      message.error("Failed to load books.");
    } finally {
      setLoadingBooks(false);
    }
  };

  return (
    <Card
      style={{
        marginTop: 16,
        // maxWidth: 1100,
        maxWidth: 1300,
        marginInline: "auto",
        borderRadius: 12,
        border: "6px double #144702",
        background: "#D9F2D0",
        padding: 10,
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <Title level={4} style={{ color: "#ae1a1a" }}>
          DATA ENTRY FORM – CGL BOOK
        </Title>
        <Text type="secondary">
          Single Book Entry • (Parts 1-3.).
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{ entryMode: "regular", bookGroupNo: 0, section: 0 }}
      >
        {/* PART 1 */}
        <Card size="small" style={{ marginBottom: 16, border: "4px double red" }}>
          <Title level={5} style={{ textAlign: "center", color: "#ae1a1a" }}>
            PART 1 – TYPE OF BOOK ENTRY
          </Title>
          <Text style={{ textAlign: "center", color: "#ae1a1acb", display: "block", marginBottom: 10 }}>Select the type of book entry.</Text>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            {/* CENTER – RADIO OPTIONS */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 120,
                flex: 1,
              }}
            >
              <label>
                <input
                  type="radio"
                  value="regular"
                  checked={entryMode === "regular"}
                  onChange={handleEntryModeChange}
                />{" "}
                <Text strong>
                  01 – Create Regular series (work only in Part 3.)
                </Text>
              </label>

              <label>
                <input
                  type="radio"
                  value="insert"
                  checked={entryMode === "insert"}
                  onChange={handleEntryModeChange}
                />{" "}
                <Text strong>
                  02 – Deliberate Insert – New Book (work in Part 2.)
                </Text>
              </label>
            </div>

            {/* RIGHT – VIEW BOOKS BUTTON */}
            <Button
              onClick={handleViewBooks}
              style={{
                border: "2px solid red",
                padding: "8px 22px",
                fontWeight: 600,
                height: "auto",
              }}
            >
              View All Books
            </Button>
          </div>

        </Card>

        {/* PART 2 – INSERT */}
        {entryMode === "insert" && (
          <Card size="small" style={{ marginBottom: 16, border: "4px double red" }}>
            <Title
              level={5}
              style={{ textAlign: "center", color: "#ae1a1a", marginBottom: 16 }}
            >
              PART 2 – DELIBERATE INSERT OF A NEW BOOK
            </Title>

            {/* ================= EXISTING BOOK (AUTO + DISABLED) ================= */}

            <Row gutter={12}>
              <Col md={6}>
                <Form.Item
                  label={
                    <>
                      <Text strong>03 – M. Book No</Text>
                      <br />
                      <Text type="secondary">(Existing reference)</Text>
                    </>
                  }
                  name="refMBookNo"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    disabled
                    style={{ width: "100%", border: "1px solid black" }}
                    formatter={(value) => formatMBook(value)}
                    parser={(value) => Number(value)}
                  />
                </Form.Item>
              </Col>

              <Col md={6}>
                <Form.Item
                  label={
                    <>
                      <Text strong>04 – S. Book No</Text>
                      <br />
                      <Text type="secondary">(Existing reference)</Text>
                    </>
                  }
                  name="refSBookNo"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    disabled
                    style={{ width: "100%", border: "1px solid black" }}
                    formatter={(value) => formatSBook(value)}
                    parser={(value) => Number(value)}
                  />
                </Form.Item>
              </Col>

              <Col md={6}>
                <Form.Item
                  label={
                    <>
                      <Text strong>04a – Book Gp No</Text>
                      <br />
                      {/* <Text type="secondary">(Existing reference)</Text> */}
                    </>
                  }
                  name="refBookGroupNo"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    disabled
                    style={{ width: "100%", border: "1px solid black" }}
                  />
                </Form.Item>
              </Col>

              <Col md={6}>
                <Form.Item
                  label={
                    <>
                      <Text strong>05a –Book Section</Text>
                      <br />
                      <Text type="">(Existing reference)</Text>
                    </>
                  }
                  name="refSection"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    disabled
                    style={{ width: "100%", border: "1px solid black" }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={<Text strong>05 – Existing Book Title</Text>}
              name="existingBookTitle"
            >
              <Input disabled style={{ border: "2px solid red" }} />
            </Form.Item>

            {/* ================= NEW BOOK (MANUAL INPUT ALLOWED) ================= */}

            <Row gutter={12}>
              <Col md={6}>
                <Form.Item
                  label={
                    <>
                      <Text strong>03a – M. Book No</Text>
                      <br />
                      <Text type="secondary">(Newly Insert)</Text>
                    </>
                  }
                  name="newMBookNo"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: "100%", border: "1px solid black" }}
                    formatter={(value) => formatMBook(value)}
                    parser={(value) => Number(value)}
                  />
                </Form.Item>
              </Col>

              <Col md={6}>
                <Form.Item
                  label={
                    <>
                      <Text strong>04a – S. Book No</Text>
                      <br />
                      <Text type="secondary">(Newly Insert)</Text>
                    </>
                  }
                  name="newSBookNo"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: "100%", border: "1px solid black" }}
                    formatter={(value) => formatSBook(value)}
                    parser={(value) => Number(value)}
                  />
                </Form.Item>
              </Col>

              <Col md={6}>
                <Form.Item
                  label={
                    <>
                      <Text strong>04a – Book Gp No</Text>
                      <br />
                      <Text type="secondary">(Book Belongs)</Text>
                    </>
                  }
                  name="newBookGroupNo"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: "100%", border: "1px solid black" }}
                  />
                </Form.Item>
              </Col>

              <Col md={6}>
                <Form.Item
                  label={
                    <>
                      <Text strong>05a – Book Section</Text>
                      <br />
                      <Text type="secondary">(Book Belongs)</Text>
                    </>
                  }
                  name="newSection"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: "100%", border: "1px solid black" }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={<Text strong>06 – New Book Title</Text>}
              name="newBookTitle"
              rules={[{ required: true }]}
            >
              <Input style={{ border: "1px solid black" }} />
            </Form.Item>

            <Form.Item
              label={<Text strong>07 – Reason for inserting this book (optional)</Text>}
              name="insertReason"
            >
              <Input.TextArea
                rows={3}
                style={{ border: "1px solid black" }}
              />
            </Form.Item>

            <Form.Item
              name="introParas"
              label={<Text strong>11 – Brief Introduction of the Book</Text>}
              rules={[{ required: true }]}
            >
              <Input.TextArea
                rows={4}
                style={{ border: "1px solid black" }}
              />
            </Form.Item>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button>Create Authors Note</Button>
              <Button type="primary">View Authors Note</Button>

              <Button
                type="primary"
                onClick={handleSaveInsertPlan}
                loading={savingInsertPlan}
              >
                SAVE 01 – Calculate Insert Location
              </Button>

              <Button
                type="primary"
                onClick={handleSaveInsertedBook}
                loading={savingBook}
                disabled={!insertCalculated}
              >
                SAVE 02 – Save Inserted Book
              </Button>
            </div>

          </Card>
        )}



        {/* PART 3 */}
        {entryMode === "regular" && (
          <Card size="small" style={{ border: "4px double red" }}>
            <Title level={5} style={{ textAlign: "center", color: "#ae1a1aff", marginBottom: 16 }}>
              PART 3 – CURRENT BOOK UNDER DEVELOPMENT
            </Title>

            <Paragraph style={{ marginBottom: 12 }}>
              <Text strong>07–12.</Text>{" "}
              <Text>
                Final book details. In deliberate insert mode, 07 &amp; 08 are filled
                automatically after SAVE 01.
              </Text>
            </Paragraph>

            <Row gutter={16}>
              <Col md={6}>
                <Form.Item
                  name="mBookNo"
                  label={<Text strong>07 – M. Book No</Text>}
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={10}
                    max={9990}
                    step={10}
                    style={{ width: "100%", border: "1px solid black" }}
                    formatter={(value) =>
                      value ? String(value).padStart(4, "0") : ""
                    }
                    parser={(value) => Number(value)}
                  />
                </Form.Item>
              </Col>

              <Col md={6}>
                <Form.Item
                  name="sBookNo"
                  label={<Text strong>08 – S. Book No</Text>}
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={5}
                    max={95}
                    step={5}
                    style={{ width: "100%", border: "1px solid black" }}
                    formatter={(value) =>
                      value ? String(value).padStart(2, "0") : ""
                    }
                    parser={(value) => Number(value)}
                  />
                </Form.Item>
              </Col>

              <Col md={6}>
                <Form.Item name="bookGroupNo" label={<Text strong>09 – Book Group No (default 00)</Text>}>
                  <InputNumber style={{ width: "100%", border: "1px solid black" }} />
                </Form.Item>
              </Col>

              <Col md={6}>
                <Form.Item name="section" label={<Text strong>09a – Book Section No (default 00)</Text>}>
                  <InputNumber style={{ width: "100%", border: "1px solid black" }} />
                </Form.Item>
              </Col>



            </Row>

            <Form.Item name="bookTitle" label={<Text strong>10 – Book Title</Text>} rules={[{ required: true }]}>
              <Input style={{ border: "1px solid black" }} />
            </Form.Item>



            <Form.Item
              name="introParas"
              label={<Text strong>11 – Brief Introduction of the Book</Text>}
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={4} style={{ border: "1.25px solid black" }} />
            </Form.Item>

            <Paragraph type="secondary" style={{ marginTop: 4 }}>
              12 – (Future option) You may show a live preview of “Current Book
              Under Development” here, using fields 07–11.
            </Paragraph>




            <Divider style={{ margin: "16px 0 12px" }} />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button >Create Authors Note</Button>
              <Button type="primary">View Authors Note</Button>
              {/* <Button onClick={handleViewBooks}>View All Books</Button> */}
              <Button
                type="primary"
                onClick={handleSaveBook}
                loading={savingBook}
              >
                SAVE 02 – Save Current Book (07–12)
              </Button>
            </div>
          </Card>
        )}
        {/* MODAL */}
        <Modal
          title="All Books"
          open={modalVisible}
          centered
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)}>
              Close
            </Button>,
          ]}
          width={1200}
          bodyStyle={{ padding: 16 }}
        >

          <Table
            rowKey="_id"
            loading={loadingBooks}
            dataSource={booksList}
            tableLayout="fixed"
            pagination={{ pageSize: 25 }}
            rowClassName={(record) => {
              if (record.typeOfEntry === "regular") return "regular-row";
              if (record.typeOfEntry === "deliberate") return "deliberate-row";
              return "";
            }}
            // or directly use rowStyle prop (AntD 5+)
            rowStyle={(record) => {
              if (record.typeOfEntry === "regular")
                return { backgroundColor: "#e6f7ff" };
              if (record.typeOfEntry === "deliberate")
                return { backgroundColor: "#fff7e6" };
              return {};
            }}
            columns={[
              {
                title: "Insert",
                width: 110,
                render: (_, record, index) => {
                  const nextRow = booksList[index + 1];

                  const hideButton =
                    nextRow &&
                    nextRow.typeOfEntry === "deliberate" &&
                    nextRow.mBookNo > record.mBookNo &&
                    nextRow.mBookNo < record.mBookNo + 10;

                  if (hideButton) return null;

                  return (
                    <Button
                      size="small"
                      style={{ color: "red", fontWeight: 600 }}
                      onClick={() => {
                        setEntryMode("insert");

                        form.setFieldsValue({
                          refMBookNo: record.mBookNo,
                          refSBookNo: record.sBookNo,
                          refBookGroupNo: record.bookGroupNo,
                          refSection: record.section,
                          existingBookTitle: record.title,
                        });

                        setModalVisible(false);
                      }}
                    >
                      Ins Below
                    </Button>
                  );
                },
              },

              {
                title: "M.Book No",
                dataIndex: "mBookNo",
                width: 90,
                render: (num) => formatMBook(num),
              },

              {
                title: "S.Book No",
                dataIndex: "sBookNo",
                width: 90,
                render: (num) => formatSBook(num),
              },

              {
                title: "Title",
                dataIndex: "title",
                width: 220,
                render: (text) => (
                  <div
                    style={{
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    {text}
                  </div>
                ),
              },

              {
                title: "Type",
                dataIndex: "typeOfEntry",
                width: 80,
                render: (type) => {
                  if (type === "regular") return "R";
                  if (type === "deliberate") return "D";
                  return "-";
                },
              },

              {
                title: "Group No",
                dataIndex: "bookGroupNo",
                width: 100,
              },

              {
                title: "Section",
                dataIndex: "section",
                width: 100,
              },

              {
                title: "Introduction",
                dataIndex: "introParas",
                width: 140,
                render: (text) => (
                  <Button
                    type="link"
                    onClick={() => {
                      setSelectedIntro(text);
                      setIntroModalVisible(true);
                    }}
                  >
                    View Intro
                  </Button>
                ),
              },

              {
                title: "Action",
                width: 170,
                render: (_, record) => (
                  <div style={{ display: "flex", gap: 6 }}>
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedIntro(record.introParas);
                        setIntroModalVisible(true);
                      }}
                    >
                      View
                    </Button>

                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleEditBook(record)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="small"
                      danger
                      onClick={() => handleDeleteBook(record._id)}
                    >
                      Delete
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </Modal>
        <Modal
          title="Book Introduction"
          open={introModalVisible}
          centered
          onCancel={() => setIntroModalVisible(false)}
          footer={null}
          width={700}
        >
          <div
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: "1.6",
              fontSize: 15,
              maxHeight: "60vh",
              overflowY: "auto",
              padding: 10,
            }}
          >
            {selectedIntro}
          </div>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Button type="primary" onClick={() => setIntroModalVisible(false)}>
              Close
            </Button>
          </div>
        </Modal>
      </Form>
    </Card>
  );
}
