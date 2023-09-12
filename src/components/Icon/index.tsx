import React from 'react';
import IconKind from '../../types/icons';
import { IconType } from '@react-icons/all-files';

import { MdOutlineCancel, MdOutlineSearch } from 'react-icons/md';

const ICON_KIND: { [key in IconKind]: IconType } = {
  cancel: MdOutlineCancel,
  search: MdOutlineSearch,
};

interface IconProps {
  kind: IconKind;
  size?: string;
  onClick?: () => void;
  color?: string;
}

const Icon = ({ kind, ...props }: IconProps) => {
  const StyledIcon = ICON_KIND[kind];
  return <StyledIcon {...props} />;
};

export default Icon;
