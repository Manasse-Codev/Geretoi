import { useState } from 'react';
import { UpdateExperience } from '@/components/UpdateExperience';

type PwaUpdateBannerProps = {
  onUpdate: () => boolean;
  onDismiss: () => void;
};

export function PwaUpdateBanner({ onUpdate, onDismiss }: PwaUpdateBannerProps) {
  const [updating, setUpdating] = useState(false);

  function update() {
    if (onUpdate()) setUpdating(true);
  }

  return <UpdateExperience mode="banner" state={updating ? 'updating' : 'ready'} onDismiss={onDismiss} onUpdate={update} />;
}
