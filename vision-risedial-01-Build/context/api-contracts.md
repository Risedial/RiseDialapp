# api-contracts.md — api_contracts Reference

**Role:** prevents agents from inventing wrong API endpoint paths, response field names, HTTP status codes, or Stripe event type strings that break existing contracts
**Status:** IMMUTABLE — do not modify during implementation phase
**Depends on:** none
**Required by:** M2, M3, M4, M6, M7, M8
**Date:** 2026-05-04

---

## Values

**endpoint:webhooks_stripe:** `/api/webhooks/stripe`
**endpoint:chat_message:** `/api/chat/[chatId]/message`
**endpoint:auth_reset_request:** `/api/auth/reset-request`
**endpoint:subscription_checkout:** `/api/subscription/checkout`
**endpoint:chats:** `/api/chats`
**status:ok:** `200`
**status:bad_request:** `400`
**status:unauthorized:** `401`
**status:payment_required:** `402`
**status:forbidden:** `403`
**status:rate_limited:** `429`
**status:server_error:** `500`
**webhook_response:received:** `{ received: true }`
**webhook_error:missing_signature:** `{ error: 'Missing stripe-signature header' }`
**webhook_error:invalid_signature:** `{ error: 'Invalid webhook signature' }`
**stripe_header:signature:** `stripe-signature`
**stripe_event:checkout_completed:** `checkout.session.completed`
**stripe_event:subscription_updated:** `customer.subscription.updated`
**stripe_event:subscription_deleted:** `customer.subscription.deleted`
**stripe_event:invoice_payment_failed:** `invoice.payment_failed`
**stripe_checkout_expand_param:** `['items.data.price']`
**stripe_checkout_metadata_field:** `metadata.user_id`
**stripe_api_version:** `2026-04-22.dahlia`
**stripe_sdk_version:** `^22.1.0`
**stripe_invoice_customer_type:** `string | Stripe.Customer | Stripe.DeletedCustomer | null`
**webhook_lib_exports:** `verifyWebhookSignature, routeWebhookEvent`
**rate_limit_return_shape:** `{ allowed: boolean, remaining: number }`
**compression_trigger_return_shape:** `{ shouldCompress: boolean, isInitial: boolean, isPatch: boolean }`
**openai_chat_model:** `gpt-4o-mini`
**openai_compression_model_premium:** `gpt-4o`
**openai_compression_model_standard:** `gpt-4o-mini`
**openai_response_format:** `{ type: 'json_object' }`
**supabase_client_export:** `supabaseServer (singleton, not a factory function)`
**supabase_client_file:** `lib/supabase/server.ts`
**lib_openai_exports:** `callRise, callCompression`
**lib_memory_executor_export:** `executeCompressionAsync`
**lib_rate_limit_exports:** `checkRateLimit, recordMessage`
**ci_skip_stripe_e2e_var:** `SKIP_STRIPE_E2E`
**e2e_base_url:** `http://localhost:3000`
**e2e_supabase_project:** `risedial-test`
**stripe_test_card:** `4242 4242 4242 4242`
**e2e_test_user_fixture:** `e2e/fixtures/test-user.json`
**ci_workflow_file:** `.github/workflows/ci.yml`
**ci_typecheck_job:** `typecheck`
**ci_unit_test_job:** `unit-tests`
**ci_e2e_job:** `e2e-tests`
**ci_artifact_retention_days:** `7`
**ci_triggers:** `push to main, pull_request targeting main`
**dead_code:PREMIUM_PRODUCT_ID:** `prod_URPiU0OHsZuXvk`
**dead_code_to_remove:** `['PREMIUM_PRODUCT_ID = \'prod_URPiU0OHsZuXvk\'', 'createServerClient', 'recordRateLimitMessage']`
