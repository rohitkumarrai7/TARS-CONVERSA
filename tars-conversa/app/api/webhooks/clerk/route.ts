import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response("Webhook secret not configured", {
      status: 500,
    });
  }

  // Get svix headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid webhook signature", {
      status: 400,
    });
  }

  // Handle events
  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, first_name, last_name, email_addresses, image_url } =
      evt.data;

    const name =
      [first_name, last_name].filter(Boolean).join(" ") || "Unknown User";

    const email = email_addresses?.[0]?.email_address ?? "";

    await fetchMutation(api.users.createOrUpdateUser, {
      clerkId: id,
      name,
      email,
      imageUrl: image_url ?? "",
    });
  }

  return new Response("OK", { status: 200 });
}
