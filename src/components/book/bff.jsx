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

  const [modalVisible, setModalVisible] = useState(false);
  const [booksList, setBooksList] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);

  const isInsertMode = entryMode === "insert";

  /* ===============================
     REGULAR MODE AUTO NUMBER
     =============================== */
  // useEffect(() => {
  //   if (entryMode === "regular") {
  //     getNextRegularApi().then((res) => {
  //       form.setFieldsValue({
  //         mBookNo: res.data.mBookNo,
  //         sBookNo: res.data.sBookNo,
  //       });
  //     });
  //   } else {
  //     // Clear numbers in insert mode
  //     form.setFieldsValue({
  //       mBookNo: undefined,
  //       sBookNo: undefined,
  //     });
  //   }
  // }, [entryMode, form]);

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

    message.success("Insert location calculated successfully.");
  } catch (err) {
    message.error("Insert calculation failed.");
  } finally {
    setSavingInsertPlan(false);
  }
};

const handleSaveInsertedBook = async () => {
  try {
    const values = await form.validateFields([
      "newMBookNo",
      "newSBookNo",
      "newBookTitle",
      "introParas",
    ]);

    setSavingBook(true);

    await saveBookApi({
      typeOfEntry: "deliberate",
      mBookNo: values.newMBookNo,
      sBookNo: values.newSBookNo,
      bookGroupNo: values.newBookGroupNo,
      section: values.newSection,
      title: values.newBookTitle,
      introParas: values.introParas,
    });

    message.success("Inserted book saved successfully.");
    form.resetFields();
  } catch (err) {
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
        "bookTitle",
        "introParas",
      ]);

      setSavingBook(true);

      await saveBookApi({
        typeOfEntry: entryMode === "insert" ? "deliberate" : "regular",
        mBookNo: values.mBookNo,
        sBookNo: values.sBookNo,
        bookGroupNo: values.bookGroupNo,
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

  /* ===============================
     TABLE COLUMNS
     =============================== */
  const columns = [
    { title: "M.BookNo", dataIndex: "mBookNo" },
    { title: "S.BookNo", dataIndex: "sBookNo" },
    { title: "Title", dataIndex: "title" },
    { title: "Type", dataIndex: "typeOfEntry" },
    { title: "Group No", dataIndex: "bookGroupNo" },

    { title: "Section", dataIndex: "Section" },







    {
      title: "Introduction",
      dataIndex: "introParas",
      render: (text) =>
        text && text.length > 60 ? text.slice(0, 60) + "..." : text,
    },
  ];

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
        initialValues={{ entryMode: "regular", bookGroupNo: 0 }}
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
    <Title level={5} style={{ textAlign: "center", color: "#ae1a1a" }}>
      PART 2 – DELIBERATE INSERT OF A NEW BOOK
    </Title>

    {/* ===== EXISTING BOOK (AUTO TRANSFERRED & DISABLED) ===== */}

    <Row gutter={16}>
      <Col md={6}>
        <Form.Item name="refMBookNo" label="03 – M.Book No (Reference)">
          <InputNumber disabled style={{ width: "100%" }} />
        </Form.Item>
      </Col>

      <Col md={6}>
        <Form.Item name="refSBookNo" label="04 – S.Book No (Reference)">
          <InputNumber disabled style={{ width: "100%" }} />
        </Form.Item>
      </Col>

      <Col md={6}>
        <Form.Item name="refBookGroupNo" label="04a – Book Group No">
          <InputNumber disabled style={{ width: "100%" }} />
        </Form.Item>
      </Col>

      <Col md={6}>
        <Form.Item name="refSection" label="05a – Section">
          <InputNumber disabled style={{ width: "100%" }} />
        </Form.Item>
      </Col>
    </Row>

    <Form.Item name="existingBookTitle" label="05 – Existing Book Title">
      <Input disabled />
    </Form.Item>

    <Divider />

    {/* ===== NEW BOOK TITLE ===== */}

    <Form.Item
      name="newBookTitle"
      label="06 – New Book Title"
      rules={[{ required: true, message: "Please enter new book title" }]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name="insertReason"
      label="07 – Reason for Insert (Optional)"
    >
      <Input.TextArea rows={3} />
    </Form.Item>

    <Button
      type="primary"
      onClick={handleSaveInsertPlan}
      loading={savingInsertPlan}
      style={{ marginBottom: 20 }}
    >
      SAVE 01 – Calculate Insert Location
    </Button>

    <Divider />

    {/* ===== NEW CALCULATED LOCATION (AUTO AFTER SAVE 01) ===== */}

    <Title level={5} style={{ color: "green" }}>
      New Insert Location (System Generated)
    </Title>

    <Row gutter={16}>
      <Col md={6}>
        <Form.Item name="newMBookNo" label="New M.Book No">
          <InputNumber disabled style={{ width: "100%" }} />
        </Form.Item>
      </Col>

      <Col md={6}>
        <Form.Item name="newSBookNo" label="New S.Book No">
          <InputNumber disabled style={{ width: "100%" }} />
        </Form.Item>
      </Col>

      <Col md={6}>
        <Form.Item name="newBookGroupNo" label="New Group No">
          <InputNumber disabled style={{ width: "100%" }} />
        </Form.Item>
      </Col>

      <Col md={6}>
        <Form.Item name="newSection" label="New Section">
          <InputNumber disabled style={{ width: "100%" }} />
        </Form.Item>
      </Col>
    </Row>

    <Form.Item
      name="introParas"
      label="11 – Brief Introduction"
      rules={[{ required: true }]}
    >
      <Input.TextArea rows={4} />
    </Form.Item>

    <Button
      type="primary"
      onClick={handleSaveInsertedBook}
      loading={savingBook}
    >
      SAVE 02 – Save Inserted Book
    </Button>
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
                <Form.Item name="mBookNo" label={<Text strong>07 – M. Book No</Text>} rules={[{ required: true }]}>
                  <InputNumber style={{ width: "100%", border: "1px solid black" }} />
                </Form.Item>
              </Col>

              <Col md={6}>
                <Form.Item name="sBookNo" label={<Text strong>08 – S. Book No</Text>} rules={[{ required: true }]}>
                  <InputNumber style={{ width: "100%", border: "1px solid black" }} />
                </Form.Item>
              </Col>

              <Col md={5}>
                <Form.Item name="bookGroupNo" label={<Text strong>09 – Book Group No (default 00)</Text>}>
                  <InputNumber style={{ width: "100%", border: "1px solid black" }} />
                </Form.Item>
              </Col>

              <Col md={5}>
                <Form.Item name="bookGroupNo" label={<Text strong>09a – Book Group No (default 00)</Text>}>
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
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={1200}
          bodyStyle={{ padding: 16 }}
        >
          <Table
            rowKey="_id"
            loading={loadingBooks}
            dataSource={booksList}
            tableLayout="fixed"
            pagination={{ pageSize: 8 }}
            columns={[
              {
                title: "M.Book No",
                dataIndex: "mBookNo",
                width: 90,
              },
              {
                title: "S.Book No",
                dataIndex: "sBookNo",
                width: 90,
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
                width: 120,
              },
              {
                title: "Group No",
                dataIndex: "bookGroupNo",
                width: 100,
              },
              {
                title: "Section",
                dataIndex: "section",
                width: 120,
              },
              {
                title: "Introduction",
                dataIndex: "introParas",
                width: 350,
                render: (text) => (
                  <div
                    style={{
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      lineHeight: "1.5",
                    }}
                  >
                    {text}
                  </div>
                ),
              },
            ]}
            rowSelection={{
  type: "radio",
  onChange: (_, rows) => {
    const book = rows[0];

    form.setFieldsValue({
      refMBookNo: book.mBookNo,
      refSBookNo: book.sBookNo,
      refBookGroupNo: book.bookGroupNo,
      refSection: book.section,
      existingBookTitle: book.title,
    });

    setModalVisible(false);
  },
}}

          />
        </Modal>
            {/* <h1></h1> */}
      </Form>
    </Card>
  );
}
