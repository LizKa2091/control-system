import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout, Typography, Menu } from 'antd';

const { Header, Content, Footer } = Layout;

const MainLayout = () => {
  const location = useLocation();
  const selectedKeys = [
    location.pathname.startsWith('/projects') ? 'projects'
      : location.pathname.startsWith('/defects') ? 'defects'
      : location.pathname.startsWith('/reports') ? 'reports'
      : 'dashboard'
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', display: 'flex', alignItems: 'center' }}>
        <Typography.Title level={3} style={{ color: '#fff', margin: 0, marginRight: 24 }}>
          Система Контроля
        </Typography.Title>
        <Menu theme="dark" mode="horizontal" selectedKeys={selectedKeys} style={{ flex: 1 }} items={[
          { key: 'dashboard', label: <Link to="/dashboard">Дашборд</Link> },
          { key: 'projects', label: <Link to="/projects">Проекты</Link> },
          { key: 'defects', label: <Link to="/defects">Дефекты</Link> },
          { key: 'reports', label: <Link to="/reports">Отчёты</Link> },
        ]} />
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
  )
}

export default MainLayout
