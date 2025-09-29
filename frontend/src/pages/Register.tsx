import type { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
   Button,
   Card,
   Flex,
   Form,
   Input,
   Select,
   Typography,
   message
} from 'antd';
import { api } from '../lib/api';
import { useAuth } from '../context/useAuth';
import type { AxiosError } from 'axios';

type Role = 'engineer' | 'manager' | 'lead';

interface IFormData {
   email: string;
   password: string;
   role: Role;
}

const Register: FC = () => {
   const [form] = Form.useForm<IFormData>();
   const navigate = useNavigate();
   const { login } = useAuth();

   const onFinish = async (values: IFormData) => {
      try {
         const { data } = await api.post('/auth/register', values);

         const token: string = data?.token;
         const user = data?.user;
         if (!token) throw new Error('Токен отсутствует');

         login(token, user);
         message.success('Регистрация успешна');

         navigate('/dashboard', { replace: true });
      } catch (e: unknown) {
         const err = e as AxiosError<{ message?: string }>;

         message.error(
            err?.response?.data?.message || 'Не удалось зарегистрироваться'
         );
      }
   };

   return (
      <Flex
         style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh'
         }}
      >
         <Card style={{ width: 420 }}>
            <Typography.Title level={3} style={{ textAlign: 'center' }}>
               Регистрация
            </Typography.Title>
            <Form form={form} layout="vertical" onFinish={onFinish}>
               <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ required: true, message: 'Введите email' }]}
               >
                  <Input type="email" />
               </Form.Item>
               <Form.Item
                  name="password"
                  label="Пароль"
                  rules={[{ required: true, message: 'Введите пароль' }]}
               >
                  <Input.Password />
               </Form.Item>
               <Form.Item
                  name="role"
                  label="Роль"
                  initialValue={'engineer'}
                  rules={[{ required: true }]}
               >
                  <Select
                     options={[
                        { value: 'engineer', label: 'Инженер' },
                        { value: 'manager', label: 'Менеджер' },
                        { value: 'lead', label: 'Руководитель' }
                     ]}
                  />
               </Form.Item>
               <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                     Зарегистрироваться
                  </Button>
               </Form.Item>
               <Typography.Paragraph style={{ marginBottom: 0 }}>
                  Уже есть аккаунт? <Link to="/login">Войти</Link>
               </Typography.Paragraph>
            </Form>
         </Card>
      </Flex>
   );
};

export default Register;
