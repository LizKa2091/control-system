import { useMemo, type FC } from 'react';
import { Card, Row, Col, Statistic, Typography, Space } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useDefects } from '../lib/defects';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const { Title: AntTitle } = Typography;

const AnalyticsDashboard: FC = () => {
  const { data: defects } = useDefects();

  const analytics = useMemo(() => {
    if (!defects) return null;

    const statusStats = defects.reduce((acc, defect) => {
      acc[defect.status] = (acc[defect.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityStats = defects.reduce((acc, defect) => {
      acc[defect.priority] = (acc[defect.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const projectStats = defects.reduce((acc, defect) => {
      const project = defect.projectName || 'Без проекта';
      acc[project] = (acc[project] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const assigneeStats = defects.reduce((acc, defect) => {
      const assignee = defect.assigneeName || 'Не назначен';
      acc[assignee] = (acc[assignee] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyStats = defects
      .filter(defect => new Date(defect.createdAt) >= thirtyDaysAgo)
      .reduce((acc, defect) => {
        const date = new Date(defect.createdAt).toLocaleDateString('ru-RU');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const closedDefects = defects.filter(defect => defect.status === 'closed');
    const avgResolutionTime = closedDefects.length > 0 
      ? closedDefects.reduce((sum, defect) => {
          const created = new Date(defect.createdAt);
          const updated = new Date(defect.updatedAt);
          return sum + Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / closedDefects.length
      : 0;

    return {
      statusStats,
      priorityStats,
      projectStats,
      assigneeStats,
      dailyStats,
      avgResolutionTime,
      totalDefects: defects.length,
      closedDefects: closedDefects.length,
      openDefects: defects.length - closedDefects.length,
    };
  }, [defects]);

  if (!analytics) {
    return <div>Загрузка аналитики...</div>;
  }

  const statusLabels = {
    new: 'Новые',
    in_progress: 'В работе',
    review: 'На проверке',
    closed: 'Закрытые',
  };

  const priorityLabels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
  };

  const statusChartData = {
    labels: Object.keys(analytics.statusStats).map(key => statusLabels[key as keyof typeof statusLabels] || key),
    datasets: [
      {
        label: 'Количество дефектов',
        data: Object.values(analytics.statusStats),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const priorityChartData = {
    labels: Object.keys(analytics.priorityStats).map(key => priorityLabels[key as keyof typeof priorityLabels] || key),
    datasets: [
      {
        data: Object.values(analytics.priorityStats),
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const projectChartData = {
    labels: Object.keys(analytics.projectStats),
    datasets: [
      {
        label: 'Дефекты по проектам',
        data: Object.values(analytics.projectStats),
        backgroundColor: 'rgba(153, 102, 255, 0.8)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const dailyLabels = Object.keys(analytics.dailyStats).sort();
  const dailyChartData = {
    labels: dailyLabels,
    datasets: [
      {
        label: 'Создано дефектов',
        data: dailyLabels.map(date => analytics.dailyStats[date] || 0),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div style={{ padding: '24px' }}>
      <AntTitle level={2}>Аналитическая панель</AntTitle>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Всего дефектов"
              value={analytics.totalDefects}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Открытых дефектов"
              value={analytics.openDefects}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Закрытых дефектов"
              value={analytics.closedDefects}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Среднее время решения (дни)"
              value={analytics.avgResolutionTime.toFixed(1)}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Графики */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Дефекты по статусам" size="small">
            <Bar data={statusChartData} options={chartOptions} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Дефекты по приоритетам" size="small">
            <Doughnut data={priorityChartData} options={chartOptions} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Дефекты по проектам" size="small">
            <Bar data={projectChartData} options={chartOptions} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Динамика создания дефектов (30 дней)" size="small">
            <Line data={dailyChartData} options={lineChartOptions} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Card title="Статистика по исполнителям" size="small">
            <Row gutter={16}>
              {Object.entries(analytics.assigneeStats).map(([assignee, count]) => (
                <Col span={6} key={assignee}>
                  <Card size="small">
                    <Statistic
                      title={assignee}
                      value={count}
                      valueStyle={{ fontSize: '20px' }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsDashboard;