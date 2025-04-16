import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';

interface FilterableTabsProps {
  tabs: { label: string; value: string }[];
  onTabChange: (value: string) => void;
  initialTab?: string;
}

const FilterableTabs: React.FC<FilterableTabsProps> = ({ tabs, onTabChange, initialTab }) => {
  const [selectedTab, setSelectedTab] = useState(initialTab || tabs[0].value);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
    onTabChange(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={selectedTab} onChange={handleChange} aria-label="filterable tabs">
        {tabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
    </Box>
  );
};

export default FilterableTabs;