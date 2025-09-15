import { Card, Statistic, Row, Col } from 'antd'

const Dashboard = () => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic title="Новые" value={0} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic title="В работе" value={0} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic title="На проверке" value={0} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic title="Закрыты" value={0} />
        </Card>
      </Col>
    </Row>
  )
}

export default Dashboard;