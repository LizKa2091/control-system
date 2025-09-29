import type { FC } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Typography, Menu, Dropdown, Avatar, Space } from 'antd';
import { useAuth } from '../context/useAuth';

const { Header, Content, Footer } = Layout;

const MainLayout: FC = () => {
   const location = useLocation();
   const selectedKeys = [
      location.pathname.startsWith('/projects')
         ? 'projects'
         : location.pathname.startsWith('/defects')
         ? 'defects'
         : location.pathname.startsWith('/reports')
         ? 'reports'
         : 'dashboard'
   ];

   const { user, logout } = useAuth();
   const navigate = useNavigate();

   const userMenu = (
      <Menu
         items={[
            { key: 'profile', label: <span>{user?.email}</span> },
            { type: 'divider' },
            {
               key: 'logout',
               label: 'Выйти',
               onClick: () => {
                  logout();
                  navigate('/login');
               }
            }
         ]}
      />
   );

   const menuItems = [
      { key: 'dashboard', label: <Link to="/dashboard">Дашборд</Link> },
      user?.role && ['manager', 'lead', 'admin'].includes(user.role)
         ? { key: 'projects', label: <Link to="/projects">Проекты</Link> }
         : null,
      user?.role && ['engineer', 'manager', 'lead'].includes(user.role)
         ? { key: 'defects', label: <Link to="/defects">Дефекты</Link> }
         : null,
      user?.role && ['manager', 'lead'].includes(user.role)
         ? { key: 'reports', label: <Link to="/reports">Отчёты</Link> }
         : null
   ].filter(Boolean);

   return (
      <Layout style={{ minHeight: '100vh' }}>
         <Header
            style={{
               background: '#001529',
               display: 'flex',
               alignItems: 'center'
            }}
         >
            <Typography.Title
               level={3}
               style={{ color: '#fff', margin: 0, marginRight: 24 }}
            >
               Система Контроля
            </Typography.Title>
            <Menu
               theme="dark"
               mode="horizontal"
               selectedKeys={selectedKeys}
               style={{ flex: 1 }}
               items={menuItems}
            />
            <Dropdown
               overlay={userMenu}
               placement="bottomRight"
               trigger={['click']}
            >
               <Space style={{ color: '#fff', cursor: 'pointer' }}>
                  <Avatar>{user?.email?.[0]?.toUpperCase() || '?'}</Avatar>
                  <span>{user?.email || 'Гость'}</span>
               </Space>
            </Dropdown>
         </Header>
         <Content style={{ padding: 24 }}>
            <div className="container">
               <Outlet />
            </div>
         </Content>
         <Footer style={{ textAlign: 'center' }}>
            © {new Date().getFullYear()} Система Контроля
         </Footer>
      </Layout>
   );
};

export default MainLayout;
