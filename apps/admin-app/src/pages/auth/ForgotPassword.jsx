import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Modal } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import ApiBE from '../../services/ApiBE';
import { Link, useNavigate } from 'react-router-dom';
import { Space } from 'antd';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await ApiBE.post('auth/forgot-password', { email: values.email }, { withCredentials: true });
      setSent(true);
      message.success('Email reset đã được gửi. Vui lòng kiểm tra hộp thư.');
      Modal.success({
        title: 'Đã gửi email thành công',
        content: 'Vui lòng kiểm tra hộp thư (hoặc Spam/Promotions) và bấm vào liên kết để đặt lại mật khẩu.',
      });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Request failed';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f5ff 0%, #f9f0ff 100%)',
      padding: 16,
    }}>
      <Card style={{ width: 420, borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
        <Space align="center" style={{ justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
          <Button type="link" onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>Back</Button>
        </Space>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ marginBottom: 0 }}>Forgot Password</Title>
          <Text type="secondary">Enter your email to receive reset instructions</Text>
        </div>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Invalid email' }]}> 
            <Input prefix={<MailOutlined />} placeholder="you@example.com" size="large" disabled={sent} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading} disabled={sent}>Send</Button>
          </Form.Item>
          {sent && (
            <div style={{ color: '#389e0d', fontSize: 13, textAlign: 'center' }}>
              Đã gửi email đặt lại mật khẩu. Hãy kiểm tra hộp thư để tiếp tục.
            </div>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPassword;

