import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const passwordToTest = searchParams.get("pass") || "Admin@2026";
  const emailToTest = searchParams.get("user") || "hclhcl0@gmail.com";

  const logs = [];
  logs.push("Starting test-auth-db API for Payload CMS users...");

  try {
    const { getPayload } = await import("payload");
    const config = await import("@payload-config");
    const payload = await getPayload({ config: config.default });

    logs.push(`Attempting login for user: ${emailToTest}...`);
    
    try {
      const result = await payload.login({
        collection: "users",
        data: {
          email: emailToTest,
          password: passwordToTest,
        },
      });

      if (result && result.user) {
        logs.push("Login successful!");
        return NextResponse.json({
          success: true,
          logs,
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            department: result.user.department,
          }
        });
      } else {
        logs.push("Login failed: no user returned.");
        return NextResponse.json({ success: false, logs });
      }
    } catch (loginErr) {
      logs.push(`Login failed with error: ${loginErr.message}`);
      return NextResponse.json({ success: false, logs, error: loginErr.message });
    }
  } catch (err) {
    logs.push(`Error: ${err.message}`);
    return NextResponse.json({ success: false, logs, error: err.message }, { status: 500 });
  }
}
