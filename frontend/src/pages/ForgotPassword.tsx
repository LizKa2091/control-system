import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Flex, Form, Input, Typography, message } from 'antd';
import { api } from '../lib/api';

interface IFormData {
    email: string;
}

const ForgotPassword: FC = () => {
  const [form] = Form.useForm<IFormData>();

  const onFinish = async (values: IFormData) => {
    try {
      const { data } = await api.post('/auth/forgot', values);

      message.success(data?.message || 'Если пользователь существует, письмо отправлено');
    } 
    catch (e: any) {
      message.error(e?.response?.data?.message || 'Ошибка запроса');
    }
  }

  return (
    <Flex style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Card style={{ width: 420 }}>
        <Typography.Title level={3} style={{ textAlign: 'center' }}>Восстановление пароля</Typography.Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Введите email' }]}> 
            <Input type="email" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Отправить ссылку</Button>
          </Form.Item>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            Вспомнили пароль? <Link to="/login">Войти</Link>
          </Typography.Paragraph>
        </Form>
      </Card>
    </Flex>
  )
}

export default ForgotPassword