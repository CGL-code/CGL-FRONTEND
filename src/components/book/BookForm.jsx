// frontend/src/components/book/BookForm.jsx

import { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Divider,
  Row,
  Col,
  Typography,
  message,
} from "antd";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;

/**
 * CGL Book Data Entry Form – aligned with PDF design
 * - Part 1: Type of Book Entry (01 / 02)
 * - Part 2: Delibrate Insert of a New Book (03–06, SAVE 01)
 * - Part 3: Current Book Under Development (07–12, SAVE 02)
 *
 * Backend endpoints assumed:
 *   POST /api/book-inserts/plan   (Save 01)
 *   POST /api/books               (Save 02)
 */

export default function BookForm() {
  const [form] = Form.useForm();

  // "regular" = Create Regular series 01
  // "insert"  = Delibrate Insert – New Book 02
  const [entryMode, setEntryMode] = useState("regular");
  const [savingInsertPlan, setSavingInsertPlan] = useState(false);
  const [savingBook, setSavingBook] = useState(false);

  const isInsertMode = entryMode === "insert";
  const part2Disabled = !isInsertMode;

  const handleEntryModeChange = (e) => {
    const mode = e.target.value;
    setEntryMode(mode);

    // Optional: clear Part 2 when going back to regular mode
    if (mode === "regular") {
      form.setFieldsValue({
        refMBookNo: undefined,
        refSBookNo: undefined,
        insertTitle: undefined,
        insertReason: undefined,
      });
    }
  };

  // ---------------------------
  // SAVE 01 – Deliberate Insert Plan
  // ---------------------------
  const handleSaveInsertPlan = async () => {
    if (!isInsertMode) return;

    try {
      const values = await form.validateFields([
        "refMBookNo",
        "refSBookNo",
        "insertTitle",
      ]);

      setSavingInsertPlan(true);

      const payload = {
        refMBookNo: values.refMBookNo,
        refSBookNo: values.refSBookNo,
        title: values.insertTitle,
        reason: values.insertReason || "",
      };

      const res = await axios.post("/api/book-inserts/plan", payload);

      const { mBookNo, sBookNo, title } = res.data || {};

      form.setFieldsValue({
        mBookNo,
        sBookNo,
        bookTitle: title || values.insertTitle,
      });

      message.success("Insert location calculated. New M/S applied to Part 3.");
    } catch (err) {
      if (err?.errorFields) {
        message.error("Please fill the required fields in Part 2 (03–05).");
      } else {
        console.error("Error in SAVE 01 (insert plan):", err);
        message.error("Failed to calculate insert location. Please try again.");
      }
    } finally {
      setSavingInsertPlan(false);
    }
  };

  // ---------------------------
  // SAVE 02 – Save Book (Regular or Insert)
  // ---------------------------
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

      const payload = {
        mBookNo: values.mBookNo,
        sBookNo: values.sBookNo,
        bookGroupNo: values.bookGroupNo ?? 0,
        title: values.bookTitle,
        introParas: values.introParas || "",
        // btCode defaults to "CGL" in schema
        // isActive defaults to true in schema
      };

      await axios.post("/api/books", payload);

      message.success("Book saved successfully (Part 3 – SAVE 02).");

      form.resetFields();
      setEntryMode("regular");
    } catch (err) {
      if (err?.errorFields) {
        message.error("Please complete the required fields in Part 3 (07–11).");
      } else {
        console.error("Error in SAVE 02 (book save):", err);
        message.error("Failed to save book. Please try again.");
      }
    } finally {
      setSavingBook(false);
    }
  };

  return (
    <Card
      style={{
        marginTop: 16,
        borderRadius: 12,
        padding: 0.5,
        background: "#D9F2D0", 
        maxWidth: 1100,
        marginInline: "auto",
        border: "6px double #144702ff",
        padding: "10px"
      }}
    >
      {/* HEADER – matches your form title */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <Title level={4} style={{ marginBottom: 4, color: "#ae1a1aff" }}>
          DATA ENTRY FORM (UI) – CGL BOOK
        </Title>
        <Text type="secondary">
          Single Book Entry • Parts 1–3.).
        </Text>
      </div>

      {/* <Divider style={{ margin: "12px 0 20px" }} /> */}

      <Form
        form={form}
        layout="vertical"
        name="cgl-book-form"
        initialValues={{
          entryMode: "regular",
          bookGroupNo: 0,
        }}
      >
        {/* ----------------------------- */}
        {/* PART 1 – TYPE OF BOOK ENTRY   */}
        {/* ----------------------------- */}
        <Card
          size="small"
          style={{
            marginBottom: 16,
            borderRadius: 10,
            border: "4px double red",
            padding: "10px"
          }}
        >
          <Title level={5} style={{
            marginBottom: 8,
            color: "#ae1a1aff",
            textAlign: 'center'
          }}>
            PART 1 – TYPE OF BOOK ENTRY
          </Title>

          {/*}  <Paragraph style={{ marginBottom: 8 }}>
            <Text strong>01.</Text>{" "}
            <Text>Select the type of book entry.</Text>
          </Paragraph>*/}
          <Text style={{ textAlign: "center", display: "block" }}>Select the type of book entry.</Text>
          <Form.Item
            name="entryMode"
            style={{ marginBottom: 4 }}
            label={null}
          >

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 130,
                marginTop: 4,
              }}
            >
              {/* <Text>Select the type of book entry.</Text> */}
              <label style={{ cursor: "pointer" }}>
                <input
                  type="radio"
                  value="regular"
                  checked={entryMode === "regular"}
                  onChange={handleEntryModeChange}
                  style={{ marginRight: 6 }}
                />
                <Text>

                  <Text strong>01 – Create Regular series</Text> (work only in Part 3.)  .
                </Text>
              </label>

              <label style={{ cursor: "pointer" }}>
                <input
                  type="radio"
                  value="insert"
                  checked={entryMode === "insert"}
                  onChange={handleEntryModeChange}
                  style={{ marginRight: 6 }}
                />
                <Text>
                  <Text strong>02 – Delibrate Insert – New Book</Text> (work  in Part 2 & 3.).
                </Text>
              </label>
            </div>
          </Form.Item>

          {/*   <Paragraph type="secondary" style={{ marginTop: 6, marginBottom: 0 }}>
            • In <Text strong>Regular</Text> mode, you work only in Part 3.{" "}
            <br />
            • In <Text strong>Delibrate Insert</Text> mode, use Part 2 (03–06) first to
            calculate new M/S, then complete Part 3.
          </Paragraph>*/}
        </Card>

        {/* ------------------------------------------------- */}
        {/* PART 2 – DELIBERATE INSERT OF A NEW BOOK (03–06)  */}
        {/* ------------------------------------------------- */}
        {!part2Disabled && (
<Card
          size="small"
          style={{
            marginBottom: 16,
            borderRadius: 10,
            border: "4px double red",
            padding: "10px"
          }}
          bodyStyle={{
            opacity: part2Disabled ? 0.5 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          <Title level={5} style={{
            marginBottom: 8,
            color: "#ae1a1aff",
            textAlign: 'center'
          }}>
            PART 2 – DELIBERATE INSERT OF A NEW BOOK
          </Title>

          {/*}   <Paragraph style={{ marginBottom: 8 }}>
            <Text strong>03–06.</Text>{" "}
            <Text>
              Choose the reference book (existing M/S) and reason. System will
              always insert <Text strong>AFTER</Text> that location and transfer the
              new M/S to Part 3 (07 &amp; 08).
            </Text>
          </Paragraph>  */}

          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              {/* 03 – Reference M.BookNo */}
              <Form.Item
                label={
                  <>
                    <Text strong>03 – M. Book No</Text>
                    <br />
                    <Text type="secondary">(Existing reference)</Text>
                  </>
                }
                name="refMBookNo"
                rules={
                  isInsertMode
                    ? [
                      {
                        required: true,
                        message: "Please enter reference M. Book No (03).",
                      },
                    ]
                    : []
                }
              >
                <InputNumber
                  disabled={part2Disabled}
                  style={{ width: "100%", border: "1px solid black" }}
                  min={0}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              {/* 04 – Reference S.BookNo */}
              <Form.Item
                label={
                  <>
                    <Text strong>04 – S. Book No</Text>
                    <br />
                    <Text type="secondary">(Existing reference)</Text>
                  </>
                }
                name="refSBookNo"
                rules={
                  isInsertMode
                    ? [
                      {
                        required: true,
                        message: "Please enter reference S. Book No (04).",
                      },
                    ]
                    : []
                }
              >
                <InputNumber
                  disabled={part2Disabled}
                  style={{ width: "100%", border: "1px solid black" }}
                  min={0}
                />
              </Form.Item>
            </Col>

            <Col md={24}>
              {/* 05 – New Book Title */}
              <Form.Item
                label={<Text strong>05 – New Book Title</Text>}
                name="insertTitle"
                rules={
                  isInsertMode
                    ? [
                      {
                        required: true,
                        message: "Please enter the new book title (05).",
                      },
                    ]
                    : []
                }
              >
                <Input disabled={part2Disabled} style={{ border: "1px solid black" }} />
              </Form.Item>
            </Col>
          </Row>

          {/* 06 – Reason for inserting */}
          <Form.Item
            label={
              <Text strong>
                06 – Reason for inserting this book (optional)
              </Text>
            }
            name="insertReason"
          >
            <Input.TextArea
              disabled={part2Disabled}
              style={{ border: "1px solid black" }}
              rows={3}
              placeholder="Short explanation (06) – for future reference / audit."
            />
          </Form.Item>

          <div style={{ textAlign: "right", marginTop: 8 }}>
            <Button
              type="primary"
              onClick={handleSaveInsertPlan}
              disabled={part2Disabled}
              loading={savingInsertPlan}
            >
              SAVE 01 – Calculate Insert Location (03–06)
            </Button>
          </div>
        </Card>
        )}
        

        {/* ------------------------------------------------ */}
        {/* PART 3 – CURRENT BOOK UNDER DEVELOPMENT (07–12)  */}
        {/* ------------------------------------------------ */}
        <Card
          size="small"
          style={{
            borderRadius: 10,
            border: "4px double red",
            padding: "10px"
          }}
        >
          <Title level={5} style={{
            marginBottom: 8,
            color: "#ae1a1aff",
            textAlign: 'center'
          }}>
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
            <Col xs={24} sm={12} md={6}>
              {/* 07 – M.BookNo */}
              <Form.Item
                label={<Text strong>07 – M. Book No</Text>}
                name="mBookNo"
                rules={[
                  { required: true, message: "Please enter M. Book No (07)." },
                ]}
              >
                <InputNumber style={{ width: "100%", border: "1px solid black" }} min={0} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              {/* 08 – S.BookNo */}
              <Form.Item
                label={<Text strong>08 – S. Book No</Text>}
                name="sBookNo"
                rules={[
                  { required: true, message: "Please enter S. Book No (08)." },
                ]}
              >
                <InputNumber style={{ width: "100%", border: "1px solid black" }} min={0} />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              {/* 09 – Book Group No */}
              <Form.Item
                label={<Text strong>09 – Book Group No (default 00)</Text>}
                name="bookGroupNo"
              >
                <InputNumber style={{ width: "100%", border: "1px solid black" }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          {/* 10 – Book Title */}
          <Form.Item
            label={<Text strong>10 – Book Title</Text>}
            name="bookTitle"
            rules={[
              { required: true, message: "Please enter the book title (10)." },
            ]}
          >
            <Input style={{ border: "1px solid black" }} />
          </Form.Item>

          {/* 11 – Brief Introduction */}
          <Form.Item
            label={<Text strong>11 – Brief Introduction of the Book</Text>}
            name="introParas"
            rules={[
              {
                required: true,
                message:
                  "Please enter a brief introduction of the book (11).",
              },
            ]}
          >
            <Input.TextArea rows={4} style={{ border: "1px solid black" }} />
          </Form.Item>

          {/* 12 – Optional future preview/display area */}
          <Paragraph type="secondary" style={{ marginTop: 4 }}>
            12 – (Future option) You may show a live preview of “Current Book
            Under Development” here, using fields 07–11.
          </Paragraph>

          <Divider style={{ margin: "16px 0 12px" }} />

          <div style={{ textAlign: "right" }}>
            <Button
              type="primary"
              onClick={handleSaveBook}
              loading={savingBook}
            >
              SAVE 02 – Save Current Book (07–12)
            </Button>
          </div>
        </Card>
      </Form>
    </Card>
  );
}
