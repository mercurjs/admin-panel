import type { ComponentType } from 'react';

import type { INavItem } from '@components/layout/nav-item';
import type {
  CustomFieldContainerZone,
  CustomFieldFormTab,
  CustomFieldFormZone,
  CustomFieldModel,
  InjectionZone,
  NestedRoutePosition
} from '@medusajs/admin-shared';
import type { LoaderFunction } from 'react-router-dom';
import type { ZodFirstPartySchemaTypes } from 'zod';

export type RouteExtension = {
  Component: ComponentType;
  loader?: LoaderFunction;
  handle?: object;
  children?: RouteExtension[];
  path: string;
};

export type MenuItemExtension = {
  label: string;
  path: string;
  icon?: ComponentType;
  nested?: NestedRoutePosition;
};

export type WidgetExtension = {
  Component: ComponentType;
  zone: InjectionZone[];
};

export type DisplayExtension = {
  // @todo fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: ComponentType<{ data: any }>;
  zone: CustomFieldContainerZone;
};

export type FormFieldExtension = {
  validation: ZodFirstPartySchemaTypes;
  // @todo fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component?: ComponentType<any>;
  label?: string;
  description?: string;
  placeholder?: string;
};

export type FormExtension = {
  zone: CustomFieldFormZone;
  tab?: CustomFieldFormTab;
  fields: Record<string, FormFieldExtension>;
};

export type ConfigFieldExtension = {
  // @todo fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue: ((data: any) => any) | any;
  validation: ZodFirstPartySchemaTypes;
};

export type ConfigExtension = {
  zone: CustomFieldFormZone;
  fields: Record<string, ConfigFieldExtension>;
};

export type LinkModule = {
  links: Record<CustomFieldModel, (string | string[])[]>;
};

export type DisplayModule = {
  displays: Record<CustomFieldModel, DisplayExtension[]>;
};

export type FormModule = {
  customFields: Record<
    CustomFieldModel,
    {
      forms: FormExtension[];
      configs: ConfigExtension[];
    }
  >;
};

export type WidgetModule = {
  widgets: WidgetExtension[];
};

export type RouteModule = {
  routes: RouteExtension[];
};

export type MenuItemModule = {
  menuItems: MenuItemExtension[];
};

export type MenuItemKey = 'coreExtensions' | 'settingsExtensions';

export type FormField = FormFieldExtension & {
  name: string;
};

export type TabFieldMap = Map<CustomFieldFormTab, FormField[]>;

export type ZoneStructure = {
  components: FormField[];
  tabs: TabFieldMap;
};

export type FormZoneMap = Map<CustomFieldFormZone, ZoneStructure>;

export type FormFieldMap = Map<CustomFieldModel, FormZoneMap>;

export type ConfigField = ConfigFieldExtension & {
  name: string;
};

export type ConfigFieldMap = Map<CustomFieldModel, Map<CustomFieldFormZone, ConfigField[]>>;

export type DisplayMap = Map<
  CustomFieldModel,
  // @todo fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Map<CustomFieldContainerZone, ComponentType<{ data: any }>[]>
>;

export type MenuMap = Map<MenuItemKey, INavItem[]>;

export type WidgetMap = Map<InjectionZone, ComponentType[]>;

export type DashboardPlugin = {
  formModule: FormModule;
  displayModule: DisplayModule;
  menuItemModule: MenuItemModule;
  widgetModule: WidgetModule;
  routeModule: RouteModule;
};
