import { useState, useMemo } from 'react';
import { Card, Typography, Button, Space, Select, DatePicker, Row, Col, message } from 'antd';
import { DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { useDefects } from '../lib/defects';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Reports = () => {
  const { data: defects } = useDefects();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [selectedPriority, setSelectedPriority] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);

  const filteredDefects = useMemo(() => {
    if (!defects) return [];

    return defects.filter(defect => {
      const matchesStatus = !selectedStatus || defect.status === selectedStatus;
      const matchesPriority = !selectedPriority || defect.priority === selectedPriority;
      
      let matchesDate = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const defectDate = new Date(defect.createdAt);
        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');
        matchesDate = defectDate >= startDate && defectDate <= endDate;
      }

      return matchesStatus && matchesPriority && matchesDate;
    });
  }, [defects, selectedStatus, selectedPriority, dateRange]);

  const exportToCSV = () => {
    if (filteredDefects.length === 0) {
      message.warning('Нет данных для экспорта');
      return;
    }

    const headers = [
      'ID',
      'Название',
      'Описание',
      'Проект',
      'Статус',
      'Приоритет',
      'Исполнитель',
      'Автор',
      'Дата создания',
      'Дата обновления',
      'Количество комментариев',
      'Количество вложений'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredDefects.map(defect => [
        defect.id,
        `"${defect.title}"`,
        `"${defect.description || ''}"`,
        `"${defect.projectName || ''}"`,
        defect.status,
        defect.priority,
        `"${defect.assigneeName || ''}"`,
        `"${defect.createdByName}"`,
        new Date(defect.createdAt).toLocaleDateString('ru-RU'),
        new Date(defect.updatedAt).toLocaleDateString('ru-RU'),
        defect.comments.length,
        defect.attachments.length
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `defects_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('CSV файл успешно экспортирован');
  };

  const exportToExcel = () => {
    message.info('Экспорт в Excel будет добавлен в следующей версии');
  };

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

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Отчёты и аналитика</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Фильтры для экспорта</Title>
        <Row gutter={16} align="middle">
          <Col>
            <Space wrap>
              <Select
                placeholder="Статус"
                value={selectedStatus}
                onChange={setSelectedStatus}
                allowClear
                style={{ width: 150 }}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <Select.Option key={value} value={value}>{label}</Select.Option>
                ))}
              </Select>
              
              <Select
                placeholder="Приоритет"
                value={selectedPriority}
                onChange={setSelectedPriority}
                allowClear
                style={{ width: 150 }}
              >
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <Select.Option key={value} value={value}>{label}</Select.Option>
                ))}
              </Select>
              
              <RangePicker
                placeholder={['Дата начала', 'Дата окончания']}
                value={dateRange}
                onChange={setDateRange}
              />
              
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={exportToCSV}
                disabled={filteredDefects.length === 0}
              >
                Экспорт CSV ({filteredDefects.length})
              </Button>
              
              <Button
                icon={<FileExcelOutlined />}
                onClick={exportToExcel}
                disabled={filteredDefects.length === 0}
              >
                Экспорт Excel
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <AnalyticsDashboard />
    </div>
  );
};

export default Reports;