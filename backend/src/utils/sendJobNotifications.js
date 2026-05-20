import { sendMail } from '../utils/SendEmail.utils.js';

export const sendBulkMails = async ({
  users,
  applyLink,
  company,
  description,
  jobTitle = 'New Opportunity',
}) => {
  if (!Array.isArray(users) || users.length === 0) {
    console.log('[sendBulkMails] No users provided. Skipping.');
    return { sent: 0, failed: 0 };
  }
  if (!applyLink || !company || !description) {
    throw new Error('applyLink, company, and description are required');
  }

  const results = await Promise.allSettled(
    users.map((user) =>
      sendMail({
        to: user.email,
        subject: `Job Match: ${jobTitle} at ${company}`,
        html: buildEmailTemplate({
          user,
          company,
          description,
          applyLink,
          jobTitle,
        }),
      })
    )
  );

  const failed = [];
  let sent = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      sent++;
    } else {
      failed.push({
        email: users[index]?.email ?? 'unknown',
        error: result.reason?.message ?? 'Unknown error',
      });
      console.error(
        `[sendBulkMails] Failed to send to ${users[index]?.email}:`,
        result.reason
      );
    }
  });

  console.log(`[sendBulkMails] Sent: ${sent}, Failed: ${failed.length}`);
  return { sent, failed };
};

/**
 * Builds the HTML email body.
 */
function buildEmailTemplate({
  user,
  company,
  description,
  applyLink,
  jobTitle,
}) {
  const greeting = user?.name ? `Hi ${user.name},` : 'Hi there,';
  const year = new Date().getFullYear();

  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Job Match – ${company}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4ff;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background-color:#f0f4ff;padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table role="presentation" width="100%" style="max-width:580px;background:#ffffff;
               border-radius:12px;overflow:hidden;
               box-shadow:0 4px 24px rgba(30,80,200,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a56db 0%,#3b82f6 100%);
                       padding:36px 40px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:2px;
                         color:rgba(255,255,255,0.75);text-transform:uppercase;">
                Job Match Found
              </p>
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">
                ${jobTitle}
              </h1>
              <p style="margin:10px 0 0;font-size:16px;color:rgba(255,255,255,0.85);font-weight:500;">
                ${company}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 24px;">
              <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
                ${greeting}
              </p>
              <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
                We found a new job opening that matches your skills and profile. Here's a quick
                overview of the role:
              </p>

              <!-- Description card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:#f0f4ff;border-left:4px solid #1a56db;
                            border-radius:6px;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;font-size:14px;color:#1e3a6e;line-height:1.7;">
                    ${description}
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td align="center">
                    <a href="${applyLink}"
                       style="display:inline-block;padding:14px 36px;
                              background:linear-gradient(135deg,#1a56db,#3b82f6);
                              color:#ffffff;font-size:15px;font-weight:600;
                              text-decoration:none;border-radius:8px;
                              letter-spacing:0.3px;
                              box-shadow:0 4px 12px rgba(26,86,219,0.35);">
                      Apply Now →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">
                You're receiving this because your profile matched this opportunity.
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${year} JobMatch. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
  <!-- /Wrapper -->

</body>
</html>`;
}
