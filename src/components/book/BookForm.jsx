// frontend/src/components/book/BookForm.jsx

import { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Radio,
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
 * CGL Book Data Entry Form
 * - Part 1: Type of Book Entry (Regular vs Deliberate Insert)
 * - Part 2: Deliberate Insert tool (ref M/S + reason + Save 01)
 * - Part 3: Actual Book details (M/S + group + title + intro + Save 02)
 *
 * Endpoints assumed:
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

  const handleEntryModeChange = (e) => {
    const mode = e.target.value;
    setEntryMode(mode);

    // When switching back to "regular", we can optionally clear Part 2 fields.
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
    if (entryMode !== "insert") {
      // Safety guard: do nothing if user is in regular mode
      return;
    }

    try {
      // Validate only the fields in Part 2
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

      // Call backend to calculate new M/S and log BookInsert
      const res = await axios.post("/api/book-inserts/plan", payload);

      // Assume backend returns: { mBookNo, sBookNo, title }
      const { mBookNo, sBookNo, title } = res.data || {};

      // Apply returned values into Part 3 fields 07, 08, 10
      form.setFieldsValue({
        mBookNo,
        sBookNo,
        bookTitle: title || values.insertTitle,
      });

      message.success("Insert plan saved. New M/S applied to Part 3.");
    } catch (err) {
      if (err?.errorFields) {
        // Validation error
        message.error("Please fill the required fields in Part 2.");
      } else {
        console.error("Error in Save 01 (insert plan):", err);
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
      // Validate Part 3 fields
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
        // btCode will take default "CGL" in the backend schema
        // isActive will default to true
      };

      await axios.post("/api/books", payload);

      message.success("Book saved successfully.");

      // Optional: reset the form for the next entry
      form.resetFields();
      setEntryMode("regular");
    } catch (err) {
      if (err?.errorFields) {
        // Validation error
        message.error("Please complete the required fields in Part 3.");
      } else {
        console.error("Error in Save 02 (book save):", err);
        message.error("Failed to save book. Please try again.");
      }
    } finally {
      setSavingBook(false);
    }
  };

  const isInsertMode = entryMode === "insert";
  const part2Disabled = !isInsertMode;

  return (
    <Card
      style={{
        marginTop: 16,
        padding: 24,
        borderRadius: 12,
        // Light green container as per your design
        background: "#f6ffed",
      }}
      bordered
    >
      <Title level={4} style={{ marginBottom: 8 }}>
        Data Entry Form (UI) – CGL BOOK
      </Title>
      <Text type="secondary">
        One unified form with three logical parts (01, 02, 03).
      </Text>

      <Divider />

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
        {/* PART 1 – Type of Book Entry   */}
        {/* ----------------------------- */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5} style={{ marginBottom: 12 }}>
            Part 1 – Type of Book Entry
          </Title>

          <Form.Item
            label="Select the Type of Book Entry"
            name="entryMode"
            style={{ marginBottom: 0 }}
          >
            <Radio.Group onChange={handleEntryModeChange}>
              <Radio value="regular">
                Create Regular series <Text strong>(01)</Text>
              </Radio>
              <Radio value="insert" style={{ marginLeft: 24 }}>
                Delibrate Insert – New Book <Text strong>(02)</Text>
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Paragraph type="secondary" style={{ marginTop: 8 }}>
            • In Regular mode, you directly enter the next planned book in Part 3. <br />
            • In Deliberate Insert mode, use Part 2 to calculate the new M/S location.
          </Paragraph>
        </Card>

        {/* ---------------------------------------------- */}
        {/* PART 2 – Deliberate Insert of a New Book (03–06) */}
        {/* ---------------------------------------------- */}
        <Card
          size="small"
          style={{ marginBottom: 16 }}
          bodyStyle={{ opacity: part2Disabled ? 0.5 : 1 }}
        >
          <Title level={5} style={{ marginBottom: 12 }}>
            Part 2 – Delibrate Insert of a New Book
          </Title>

          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Decide the insert location (always <Text strong>after</Text> the selected book).
            System will compute the new M/S and transfer it to Part 3 (fields 07 &amp; 08).
          </Paragraph>

          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              {/* 03 – Reference M.BookNo */}
              <Form.Item
                label={
                  <>
                    03 – M. Book No <br />
                    <Text type="secondary">(Existing reference)</Text>
                  </>
                }
                name="refMBookNo"
                rules={
                  isInsertMode
                    ? [
                        { required: true, message: "Please enter reference M.Book No" },
                      ]
                    : []
                }
              >
                <InputNumber
                  disabled={part2Disabled}
                  style={{ width: "100%" }}
                  min={0}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              {/* 04 – Reference S.BookNo */}
              <Form.Item
                label={
                  <>
                    04 – S. Book No <br />
                    <Text type="secondary">(Existing reference)</Text>
                  </>
                }
                name="refSBookNo"
                rules={
                  isInsertMode
                    ? [
                        { required: true, message: "Please enter reference S.Book No" },
                      ]
                    : []
                }
              >
                <InputNumber
                  disabled={part2Disabled}
                  style={{ width: "100%" }}
                  min={0}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              {/* 05 – New Book Title */}
              <Form.Item
                label="05 – New Book Title"
                name="insertTitle"
                rules={
                  isInsertMode
                    ? [{ required: true, message: "Please enter the new book title" }]
                    : []
                }
              >
                <Input disabled={part2Disabled} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="06 – Reason for inserting this book (optional)"
            name="insertReason"
          >
            <Input.TextArea
              disabled={part2Disabled}
              rows={3}
              placeholder="Short explanation for future reference"
            />
          </Form.Item>

          <Button
            type="primary"
            onClick={handleSaveInsertPlan}
            disabled={part2Disabled}
            loading={savingInsertPlan}
          >
            SAVE 01 – Calculate Insert Location
          </Button>
        </Card>

        {/* ---------------------------------------------- */}
        {/* PART 3 – Current Book Under Development (07–12) */}
        {/* ---------------------------------------------- */}
        <Card size="small">
          <Title level={5} style={{ marginBottom: 12 }}>
            Part 3 – Current Book Under Development
          </Title>

          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              {/* 07 – M.BookNo */}
              <Form.Item
                label="07 – M. Book No"
                name="mBookNo"
                rules={[
                  { required: true, message: "Please enter M.Book No" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              {/* 08 – S.BookNo */}
              <Form.Item
                label="08 – S. Book No"
                name="sBookNo"
                rules={[
                  { required: true, message: "Please enter S.Book No" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              {/* 09 – Book Group No */}
              <Form.Item
                label="09 – Book Group No (default 00)"
                name="bookGroupNo"
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          {/* 10 – Book Title */}
          <Form.Item
            label="10 – Book Title"
            name="bookTitle"
            rules={[
              { required: true, message: "Please enter the book title" },
            ]}
          >
            <Input />
          </Form.Item>

          {/* 11 – Brief Introduction */}
          <Form.Item
            label="11 – Brief Introduction of the Book"
            name="introParas"
            rules={[
              {
                required: true,
                message: "Please enter a brief introduction for the book",
              },
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          {/* 12 – Optional: you can implement a preview here later */}
          <Paragraph type="secondary">
            12 – (Optional future enhancement) Display or preview “Current Book
            Under Development” here.
          </Paragraph>

          <Divider />

          <Button
            type="primary"
            onClick={handleSaveBook}
            loading={savingBook}
          >
            SAVE 02 – Save Book
          </Button>
        </Card>
      </Form>
    </Card>
  );
}
