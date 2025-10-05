import { useMemo, useState } from 'react';
import {
   Button,
   Space,
   Table,
   Tag,
   Popconfirm,
   Input,
   Select,
   Card
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import {
   useAdvanceStatus,
   useCreateDefect,
   useDefects,
   useDeleteDefect,
   useUpdateDefect,
   type Defect
} from '../lib/defects';
import DefectForm, { type DefectFormValues } from '../components/DefectForm';
import DefectDetail from '../components/DefectDetail';

const statusToColor: Record<string, string> = {
   new: 'default',
   in_progress: 'processing',
   review: 'warning',
   closed: 'success'
};

const statusToLabel: Record<string, string> = {
   new: 'Новый',
   in_progress: 'В работе',
   review: 'На проверке',
   closed: 'Закрыт'
};

const priorityToLabel: Record<string, string> = {
   low: 'Низкий',
   medium: 'Средний',
   high: 'Высокий'
};

const Defects = () => {
   const { data } = useDefects();
   const createMutation = useCreateDefect();
   const updateMutation = useUpdateDefect();
   const deleteMutation = useDeleteDefect();
   const advanceMutation = useAdvanceStatus();

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editing, setEditing] = useState<Defect | null>(null);
   const [viewingId, setViewingId] = useState<string | null>(null);
   const [searchText, setSearchText] = useState('');
   const [statusFilter, setStatusFilter] = useState<string | undefined>(
      undefined
   );
   const [priorityFilter, setPriorityFilter] = useState<string | undefined>(
      undefined
   );

   const filteredData = useMemo(() => {
      if (!data) return [];

      return data.filter((defect) => {
         const matchesSearch =
            !searchText ||
            defect.title.toLowerCase().includes(searchText.toLowerCase()) ||
            defect.description
               ?.toLowerCase()
               .includes(searchText.toLowerCase()) ||
            defect.project?.name
               ?.toLowerCase()
               .includes(searchText.toLowerCase()) ||
            defect.assignee?.email
               ?.toLowerCase()
               .includes(searchText.toLowerCase());

         const matchesStatus = !statusFilter || defect.status === statusFilter;
         const matchesPriority =
            !priorityFilter || defect.priority === priorityFilter;

         return matchesSearch && matchesStatus && matchesPriority;
      });
   }, [data, searchText, statusFilter, priorityFilter]);

   const columns = useMemo(
      () => [
         {
            title: 'Заголовок',
            dataIndex: 'title',
            width: 200,
            ellipsis: true
         },
         {
            title: 'Проект',
            dataIndex: ['project', 'name'],
            width: 120,
            ellipsis: true
         },
         {
            title: 'Статус',
            dataIndex: 'status',
            width: 120,
            render: (status: string) => (
               <Tag color={statusToColor[status] || 'default'}>
                  {statusToLabel[status] || status}
               </Tag>
            )
         },
         {
            title: 'Приоритет',
            dataIndex: 'priority',
            width: 100,
            render: (priority: string) => priorityToLabel[priority] || priority
         },
         {
            title: 'Исполнитель',
            dataIndex: ['assignee', 'email'],
            width: 120,
            ellipsis: true
         },
         {
            title: 'Создан',
            dataIndex: 'createdAt',
            width: 120,
            render: (date: string) => new Date(date).toLocaleDateString('ru-RU')
         },
         {
            title: 'Действия',
            key: 'actions',
            width: 200,
            render: (_: unknown, record: Defect) => (
               <Space>
                  <Button size="small" onClick={() => setViewingId(record.id)}>
                     Просмотр
                  </Button>
                  <Button
                     size="small"
                     onClick={() => {
                        setEditing(record);
                        setIsModalOpen(true);
                     }}
                  >
                     Изменить
                  </Button>
                  <Button
                     size="small"
                     type="dashed"
                     onClick={() => advanceMutation.mutate(record.id)}
                     loading={advanceMutation.isPending}
                  >
                     Передать дальше
                  </Button>
                  <Popconfirm
                     title="Удалить дефект?"
                     okText="Да"
                     cancelText="Нет"
                     onConfirm={() => deleteMutation.mutate(record.id)}
                  >
                     <Button
                        size="small"
                        danger
                        loading={deleteMutation.isPending}
                     >
                        Удалить
                     </Button>
                  </Popconfirm>
               </Space>
            )
         }
      ],
      [advanceMutation, deleteMutation]
   );

   return (
      <>
         <Card style={{ marginBottom: 16 }}>
            <Space
               wrap
               style={{ width: '100%', justifyContent: 'space-between' }}
            >
               <Button
                  type="primary"
                  onClick={() => {
                     setEditing(null);
                     setIsModalOpen(true);
                  }}
               >
                  Создать дефект
               </Button>
               <Space wrap>
                  <Input
                     placeholder="Поиск по названию, описанию, проекту или исполнителю"
                     prefix={<SearchOutlined />}
                     value={searchText}
                     onChange={(e) => setSearchText(e.target.value)}
                     style={{ width: 300 }}
                  />
                  <Select
                     placeholder="Статус"
                     value={statusFilter}
                     onChange={setStatusFilter}
                     allowClear
                     style={{ width: 120 }}
                  >
                     <Select.Option value="new">Новый</Select.Option>
                     <Select.Option value="in_progress">В работе</Select.Option>
                     <Select.Option value="review">На проверке</Select.Option>
                     <Select.Option value="closed">Закрыт</Select.Option>
                  </Select>
                  <Select
                     placeholder="Приоритет"
                     value={priorityFilter}
                     onChange={setPriorityFilter}
                     allowClear
                     style={{ width: 120 }}
                  >
                     <Select.Option value="low">Низкий</Select.Option>
                     <Select.Option value="medium">Средний</Select.Option>
                     <Select.Option value="high">Высокий</Select.Option>
                  </Select>
               </Space>
            </Space>
         </Card>
         <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredData}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
         />
         <DefectForm
            open={isModalOpen}
            title={editing ? 'Изменить дефект' : 'Создать дефект'}
            initialValues={
               editing
                  ? {
                       title: editing.title,
                       description: editing.description,
                       projectId: editing.project?.id,
                       priority: editing.priority,
                       assigneeId: editing.assignee?.id
                    }
                  : undefined
            }
            loading={createMutation.isPending || updateMutation.isPending}
            onCancel={() => {
               setIsModalOpen(false);
               setEditing(null);
            }}
            onSubmit={(values: DefectFormValues) => {
               if (editing) {
                  updateMutation.mutate(
                     {
                        id: editing.id,
                        title: values.title,
                        description: values.description,
                        projectId: values.projectId,
                        priority: values.priority,
                        assigneeId: values.assigneeId,
                        attachments: values.attachments?.map((a) => ({
                           filename: a.name
                        }))
                     },
                     {
                        onSuccess: () => {
                           setIsModalOpen(false);
                           setEditing(null);
                        }
                     }
                  );
               } else {
                  createMutation.mutate(
                     {
                        title: values.title,
                        description: values.description,
                        projectId: values.projectId,
                        priority: values.priority,
                        assigneeId: values.assigneeId,
                        attachments: values.attachments?.map((a) => ({
                           filename: a.name
                        }))
                     },
                     {
                        onSuccess: () => {
                           setIsModalOpen(false);
                           setEditing(null);
                        }
                     }
                  );
               }
            }}
         />
         <DefectDetail
            open={!!viewingId}
            defectId={viewingId}
            onClose={() => setViewingId(null)}
         />
      </>
   );
};

export default Defects;
