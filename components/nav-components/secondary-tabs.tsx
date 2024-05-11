import React from "react";
import { styled, useTheme } from "styled-components";
import { Tabs, Tab } from '@/components/nav-components/tabs'

const TabsWrap = styled.div`
  background-color:var(--secondary-tabs-bg);
  font-size:10px;
`;

interface StyledTabsProps {
  children?: React.ReactNode;
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

interface STabsProps {
    selected: boolean;
}
const STab = styled(Tab) <STabsProps>`
    color:${({ selected }) => selected ? 'var(--secondary-tabs-selected)' : 'var(--secondary-tabs-text)'} !important;
    font-size: 9px !important;
    max-height: 10px !important;
    margin:-10px !important;
 `;

const STabs = styled(Tabs)`
  max-height:12px !important;
`;
interface Option {
  name: string;
  icon: any;
  access?: string;
}
interface Props {
  options: Option[];
  onChange: (option: Option) => void;
  selectedOptionName?: string;
}

const SecondaryTabs: React.FC<Props> = ({ options, onChange, selectedOptionName }: Props) => {
  const theme = useTheme();
  //@ts-ignore
  //const mode = theme.palette.mode;
  //const palette = theme[mode].colors;
  let selectedValue = 0;
  const IconTabs = options.map((option: Option, i: number) => {
    let name = option.name.toLowerCase();
    if (name == 'feed')
      name = 'mentions';
    console.log("options.map", option.name, selectedOptionName)
    let selected = false;
    if (name == selectedOptionName?.toLowerCase()) {
      selected = true;
      selectedValue = i;
    }
    return <STab iconPosition="start" selected={selected} key={`tab-${option.name}`} label={option.name} />;
  });
  return <TabsWrap><STabs textColor="primary" variant="fullWidth" value={selectedValue} onChange={(event, value) => { console.log("onChange-View", value); onChange(options[value]) }}>{IconTabs}</STabs></TabsWrap>;
};

export default SecondaryTabs;