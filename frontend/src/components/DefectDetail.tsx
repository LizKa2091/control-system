import { useState, type FC } from 'react';
import {
   Modal,
   Descriptions,
   Tag,
   Button,
   Space,
   List,
   Input,
   Avatar,
   Typography,
   Divider,
   Card,
   Spin
} from 'antd';
import { MessageOutlined, UserOutlined } from '@ant-design/icons';
import { useAddComment, useDefect } from '../lib/defects';

const { TextArea } = Input;
const { Text } = Typography;

interface DefectDetailProps {
   open: boolean;
   defectId: string | null;
   onClose: () => void;
}

const DefectDetail: FC<DefectDetailProps> = ({ open, defectId, onClose }) => {
   const [newComment, setNewComment] = useState('');
   const addCommentMutation = useAddComment();
   const { data: defect, isLoading } = useDefect(defectId);

   const handleAddComment = () => {
      if (newComment.trim() && defectId) {
         addCommentMutation.mutate(
            { defectId, text: newComment.trim() },
            {
               onSuccess: () => {
                  setNewComment('');
               }
            }
         );
      }
   };

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

   return (
      <Modal
         title={defect ? `Дефект: ${defect.title}` : 'Дефект'}
         open={open}
         onCancel={onClose}
         footer={null}
         width={800}
         style={{ top: 20 }}
      >
         {isLoading ? (
            <Spin />
         ) : defect ? (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
               <Card title="Основная информация" size="small">
                  <Descriptions column={2} size="small">
                     <Descriptions.Item label="Статус">
                        <Tag color={statusToColor[defect.status]}>
                           {statusToLabel[defect.status]}
                        </Tag>
                     </Descriptions.Item>
                     <Descriptions.Item label="Приоритет">
                        {priorityToLabel[defect.priority]}
                     </Descriptions.Item>
                     <Descriptions.Item label="Проект" span={2}>
                        {defect.project?.name || 'Не указан'}
                     </Descriptions.Item>
                     <Descriptions.Item label="Исполнитель" span={2}>
                        {defect.assignee?.email || 'Не назначен'}
                     </Descriptions.Item>
                     <Descriptions.Item label="Создан">
                        {new Date(defect.createdAt).toLocaleString('ru-RU')}
                     </Descriptions.Item>
                     <Descriptions.Item label="Обновлён">
                        {new Date(defect.updatedAt).toLocaleString('ru-RU')}
                     </Descriptions.Item>
                     <Descriptions.Item label="Автор" span={2}>
                        {defect.createdBy.email}
                     </Descriptions.Item>
                  </Descriptions>
               </Card>

               {defect.description && (
                  <Card title="Описание" size="small">
                     <Text>{defect.description}</Text>
                  </Card>
               )}

               {defect.attachments && defect.attachments.length > 0 && (
                  <Card title="Вложения" size="small">
                     <List
                        size="small"
                        dataSource={defect.attachments}
                        renderItem={(attachment) => (
                           <List.Item>
                              <Text code>{attachment.name}</Text>
                           </List.Item>
                        )}
                     />
                  </Card>
               )}

               <Card title="Комментарии" size="small">
                  <List
                     dataSource={defect.comments}
                     renderItem={(comment) => (
                        <List.Item>
                           <List.Item.Meta
                              avatar={<Avatar icon={<UserOutlined />} />}
                              title={
                                 <Space>
                                    <Text strong>{comment.author.email}</Text>
                                    {comment.createdAt && (
                                       <Text type="secondary">
                                          {new Date(
                                             comment.createdAt
                                          ).toLocaleString('ru-RU')}
                                       </Text>
                                    )}
                                 </Space>
                              }
                              description={<Text>{comment.text}</Text>}
                           />
                        </List.Item>
                     )}
                  />

                  <Divider />

                  <Space.Compact style={{ width: '100%' }}>
                     <TextArea
                        placeholder="Добавить комментарий..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                     />
                     <Button
                        type="primary"
                        icon={<MessageOutlined />}
                        onClick={handleAddComment}
                        loading={addCommentMutation.isPending}
                        disabled={!newComment.trim()}
                     >
                        Отправить
                     </Button>
                  </Space.Compact>
               </Card>
            </Space>
         ) : (
            <Text>Дефект не найден</Text>
         )}
      </Modal>
   );
};

export default DefectDetail;
