import { graphGet, graphGetFields } from "./graph.js";

export interface DebugTokenData {
  app_id?: string;
  type?: string;
  application?: string;
  expires_at?: number;
  is_valid?: boolean;
  scopes?: string[];
  granular_scopes?: { scope: string; target_ids?: string[] }[];
}

export interface WabaInfo {
  id: string;
  name?: string;
  currency?: string;
  timezone_id?: string;
  account_review_status?: string;
  business_verification_status?: string;
  health_status?: { can_send_message?: string };
}

export interface PhoneInfo {
  id: string;
  display_phone_number?: string;
  verified_name?: string;
  name_status?: string;
  quality_rating?: string;
  status?: string;
  platform_type?: string;
  code_verification_status?: string;
  messaging_limit_tier?: string;
  is_on_biz_app?: boolean;
  throughput?: { level?: string };
}

export interface TemplateInfo {
  id: string;
  name: string;
  status: string;
  category?: string;
  language?: string;
}

interface Paged<T> {
  data: T[];
  paging?: { cursors?: { after?: string }; next?: string };
}

export async function debugToken(signal: AbortSignal): Promise<DebugTokenData> {
  const token = process.env.META_ACCESS_TOKEN ?? "";
  const response = await graphGet<{ data: DebugTokenData }>("debug_token", { input_token: token }, signal);
  return response.data;
}

export function getWaba(wabaId: string, signal: AbortSignal): Promise<WabaInfo> {
  return graphGetFields<WabaInfo>(
    wabaId,
    [
      "id,name,currency,timezone_id,account_review_status,business_verification_status,health_status",
      "id,name,currency,timezone_id,account_review_status,business_verification_status",
      "id,name,currency"
    ],
    {},
    signal
  );
}

export async function listPhones(wabaId: string, signal: AbortSignal): Promise<PhoneInfo[]> {
  const response = await graphGetFields<Paged<PhoneInfo>>(
    `${wabaId}/phone_numbers`,
    [
      "id,display_phone_number,verified_name,name_status,quality_rating,status,platform_type,code_verification_status,messaging_limit_tier,is_on_biz_app,throughput",
      "id,display_phone_number,verified_name,name_status,quality_rating,status,platform_type,code_verification_status,messaging_limit_tier",
      "id,display_phone_number,verified_name,status"
    ],
    { limit: 50 },
    signal
  );
  return response.data;
}

export async function listTemplates(wabaId: string, limit: number, after: string | undefined, signal: AbortSignal): Promise<{ templates: TemplateInfo[]; next?: string }> {
  const response = await graphGet<Paged<TemplateInfo>>(`${wabaId}/message_templates`, { fields: "id,name,status,category,language", limit, after }, signal);
  return { templates: response.data, next: response.paging?.next ? response.paging.cursors?.after : undefined };
}

export async function listSubscribedApps(wabaId: string, signal: AbortSignal): Promise<{ id?: string; name?: string }[]> {
  const response = await graphGet<{ data: { whatsapp_business_api_data?: { id?: string; name?: string } }[] }>(`${wabaId}/subscribed_apps`, {}, signal);
  return response.data.map(item => item.whatsapp_business_api_data ?? {});
}

export interface CoexistenceInfo {
  id: string;
  display_phone_number?: string;
  is_on_biz_app?: boolean;
  platform_type?: string;
  status?: string;
  throughput?: { level?: string };
}

export function getCoexistence(phoneId: string, signal: AbortSignal): Promise<CoexistenceInfo> {
  return graphGetFields<CoexistenceInfo>(
    phoneId,
    ["id,display_phone_number,is_on_biz_app,platform_type,status,throughput", "id,display_phone_number,is_on_biz_app,platform_type"],
    {},
    signal
  );
}

export interface AppSubscription {
  object: string;
  callback_url?: string;
  active?: boolean;
  fields?: { name: string; version?: string }[];
}

export async function listAppSubscriptions(appId: string, appToken: string, signal: AbortSignal): Promise<AppSubscription[]> {
  const response = await graphGet<{ data: AppSubscription[] }>(`${appId}/subscriptions`, {}, signal, appToken);
  return response.data;
}

export function formatExpiry(expiresAt: number | undefined): string {
  if (!expiresAt) return "nunca expira";
  return `expira em ${new Date(expiresAt * 1000).toISOString().slice(0, 10)}`;
}
