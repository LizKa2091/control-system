import { type FC } from 'react';
import { Modal, List, Button, Select, Spin, Empty } from 'antd';
import {
  useProjectMembers,
  useAddProjectMember,
  useRemoveProjectMember,
  useAllUsers,
  type User,
} from '../lib/projectMembers';
import { useAuth } from '../context/useAuth';
import { ProjectComments } from './ProjectComments';
import ProjectHistory from './ProjectHistory';

interface ProjectMembersProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

const ProjectMembers: FC<ProjectMembersProps> = ({ projectId, open, onClose }) => {
  const { user } = useAuth();
  const { data: members, isLoading: membersLoading } = useProjectMembers(projectId);
  const { data: allUsers, isLoading: allUsersLoading } = useAllUsers();

  const addMember = useAddProjectMember(projectId);
  const removeMember = useRemoveProjectMember(projectId);

  const adding = addMember.isPending;
  const removing = removeMember.isPending;

  const availableUsers: User[] = (allUsers ?? []).filter(
    (u) => !members?.some((m) => m.id === u.id)
  );

  return (
    <Modal
      open={open}
      title="Участники проекта"
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={800}
    >
      <div style={{ marginBottom: 16 }}>
        {allUsersLoading ? (
          <Spin />
        ) : availableUsers.length === 0 ? (
          <Empty description="Нет доступных пользователей для добавления" />
        ) : (
          <Select
            style={{ width: '100%' }}
            placeholder="Добавить пользователя"
            onSelect={(value) => {
              const userId = String(value);
              addMember.mutate(userId);
            }}
            disabled={adding}
            loading={adding}
            showSearch
            optionFilterProp="label"
          >
            {availableUsers.map((u) => (
              <Select.Option key={u.id} value={u.id} label={`${u.name} (${u.role})`}>
                {u.name} ({u.role})
              </Select.Option>
            ))}
          </Select>
        )}
      </div>

      <List
        bordered
        loading={membersLoading}
        dataSource={members ?? []}
        renderItem={(item: User) => (
          <List.Item
            actions={[
              <Button
                type="link"
                danger
                onClick={() => removeMember.mutate(item.id)}
                loading={removing}
                key="remove"
              >
                Удалить
              </Button>,
            ]}
          >
            {item.name} ({item.role}) — <span style={{ color: '#888' }}>{item.email}</span>
          </List.Item>
        )}
        locale={{ emptyText: 'У проекта пока нет участников' }}
      />
      <div style={{ marginTop: 24 }}>
        <ProjectComments projectId={projectId} currentUserId={user?.id || ''} />
      </div>
      <div style={{ marginTop: 24 }}>
        <h3>История изменений</h3>
        <ProjectHistory projectId={projectId} />
      </div>
    </Modal>
  );
};

export default ProjectMembers;