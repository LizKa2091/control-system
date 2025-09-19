import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Flex, Form, Input, Typography, message } from 'antd';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface IFormData {
  email: string;
  password: string;
}

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const onFinish = async (values: IFormData) => {
    try {
      const { data } = await api.post('/auth/login', values);

      const token: string = data?.token;
      const user = data?.user;

      if (!token) throw new Error('Токен отсутствует');

      login(token, user)
      message.success('Добро пожаловать');

      const fromPath = location.state?.from?.pathname || '/dashboard'
      navigate(fromPath, { replace: true })
    } 
    catch (e: any) {
      message.error(e?.response?.data?.message || 'Не удалось войти')
    }
  };

  return (
    <Flex style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Card style={{ width: 360 }}>
        <Typography.Title level={3} style={{ textAlign: 'center' }}>Вход</Typography.Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Введите email' }]}> 
            <Input type="email" />
          </Form.Item>
          <Form.Item name="password" label="Пароль" rules={[{ required: true, message: 'Введите пароль' }]}> 
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Войти</Button>
          </Form.Item>
        </Form>
      </Card>
    </Flex>
  )
}

export default Login