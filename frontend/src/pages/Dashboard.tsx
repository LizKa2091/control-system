import { useMemo, type FC } from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { useDefects, type Defect } from '../lib/defects';

const Dashboard: FC = () => {
  const { data } = useDefects();
  const stats = useMemo(() => {
    const list = (data ?? []) as Defect[];
    const byStatus = {
      new: 0,
      in_progress: 0,
      review: 0,
      closed: 0,
    };

    const byPriority = {
      low: 0,
      medium: 0,
      high: 0,
    };

    for (const d of list) {
      byStatus[d.status as keyof typeof byStatus] = (byStatus[d.status as keyof typeof byStatus] || 0) + 1
      byPriority[d.priority as keyof typeof byPriority] = (byPriority[d.priority as keyof typeof byPriority] || 0) + 1
    }

    return { byStatus, byPriority };
  }, [data])

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic title="Новые" value={stats.byStatus.new} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic title="В работе" value={stats.byStatus.in_progress} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic title="На проверке" value={stats.byStatus.review} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic title="Закрыты" value={stats.byStatus.closed} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card>
          <Statistic title="Приоритет: Высокий" value={stats.byPriority.high} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card>
          <Statistic title="Приоритет: Средний" value={stats.byPriority.medium} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card>
          <Statistic title="Приоритет: Низкий" value={stats.byPriority.low} />
        </Card>
      </Col>
    </Row>
  )
}

export default Dashboard;