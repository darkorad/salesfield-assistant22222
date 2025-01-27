import { CustomerGroupSelect } from "../CustomerGroupSelect";

interface GroupSelectionProps {
  selectedGroup: { id: string; name: string } | null;
  onGroupSelect: (group: { id: string; name: string } | null) => void;
}

export const GroupSelection = ({ selectedGroup, onGroupSelect }: GroupSelectionProps) => {
  return (
    <CustomerGroupSelect
      selectedGroup={selectedGroup}
      onGroupSelect={(group) => {
        onGroupSelect(group);
      }}
    />
  );
};