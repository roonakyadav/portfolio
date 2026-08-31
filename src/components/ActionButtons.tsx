import { useMemo } from 'react';
import PillActions from './PillActions';

const ActionButtons = () => {
  const items = useMemo(() => [
    { label: 'GET IN TOUCH', href: '#contact', external: false },
    { label: 'VIEW GITHUB', href: 'https://github.com/roonakyadav', external: true },
    { label: 'VIEW RESUME', href: '#', external: true }
  ], []);

  return (
    <div className="mt-8">
      <PillActions
        items={items}
        ease="power2.easeOut"
        initialLoadAnimation={true}
      />
    </div>
  );
};

export default ActionButtons;
