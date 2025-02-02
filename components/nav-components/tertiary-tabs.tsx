import React from "react";
import { styled } from "styled-components";
import { Tabs, Tab } from '@/components/nav-components/tabs'
interface TabsProps {
  level: string;
}
const TabsWrap = styled.div<TabsProps>`
  //background-color: ${({ level }) => level === "secondary" ? 'var(--secondary-tabs-bg)' : 'var(--background)'};
  height:${({ level }) => level === "secondary" ? '22px' : 'auto'};
`;
interface STabsProps {
  selected: boolean;
  isnew: boolean;
  level: string;
  link?: string;
}
const STab = styled(Tab) <STabsProps>`
    color: green !important;
  /* background-color: ${({ selected, level }) =>
    level === "secondary"
      ? `var(--${selected ? 'secondary-tabs-bg' : 'secondary-tabs-bg'})`
      : `var(--${selected ? 'background' : 'background'})`} !important;*/
   font-size: 12px !important;
   width: 140px;
   border: 0px solid ${({ selected }) => selected ? `var(--background)` : `var(--background)`}!important;
 `;
interface Option {
  name: string;
  tab: string;
  disabled: boolean;
  link?: string;
}
interface Props {
  options: Option[];
  onChange: (option: Option) => void;
  selectedOptionName?: string;
  level?: string;
}

const TertiaryTabs: React.FC<Props> = ({ level = "primary", options, onChange, selectedOptionName }: Props) => {
  let selectedValue = 0;

  const tabs = options.map((option: Option, i: number) => {
    let selected = false;
    let optionTab = option.tab.toLowerCase();
    if (optionTab == '@') {
      optionTab = 'mentions';
    }
    let selectedOptionNameTab = selectedOptionName?.toLowerCase();
    if (selectedOptionNameTab == '@') {
      selectedOptionNameTab = 'mentions';
    }

    if (optionTab == selectedOptionNameTab) {
      selected = true;
      selectedValue = i;
    }
    // console.log("optionTab", optionTab, "selectedOptionNameTab", selectedOptionNameTab, "selected", selected);
    return <STab level={level} isnew={option.tab == 'chat'} disabled={option.disabled} selected={selected} key={`t3ab-${option.name}`} label={option.name} link={option.link} />;
  });
  return <TabsWrap level={level}><Tabs id={level == "secondary" ? "tabs6" : "tabs3"} variant="fullWidth" value={selectedValue} onChange={(event, value) => { console.log("onChange", value); onChange(options[value]) }}>{tabs}</Tabs></TabsWrap>
};

export default TertiaryTabs;