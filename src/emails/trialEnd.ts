
// Emails are stored as template strings so they're
// easy to plug variables into as simple functions.
// If you'd like HTML syntax highlighting while
// editing this email, just copy the content to a new
// HTML file and bring it back here.  Wrapping the
// template in this function makes it easy to only
// provide variables once we're actually sending
// an email with the template.
export function trialEndEmail(managerDNS: string) {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
<html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/xhtml">

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>The Eximchain Team</title>
</head>

<body
  style="-webkit-text-size-adjust: none; box-sizing: border-box; color: #626b76; font-family: 'Helvetica Neue', Helvetica, sans-serif; height: 100%; line-height: 1.4; margin: 0; width: 100% !important;"
  bgcolor="#f7f8f9">
  <style type="text/css">
    body {
      width: 100% !important;
      height: 100%;
      margin: 0;
      line-height: 1.4;
      background-color: #fff;
      color: #626b76;
      -webkit-text-size-adjust: none;
    }

    @media only screen and (max-width: 600px) {
      .email-body_inner {
        width: 100% !important;
      }

      .email-footer {
        width: 100% !important;
      }
    }

    @media only screen and (max-width: 500px) {
      .button {
        width: 100% !important;
      }
    }
  </style> <span class="preheader"
    style="box-sizing: border-box; display: none !important; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; mso-hide: all; opacity: 0; overflow: hidden; visibility: hidden;">Eximchain
    - Token Verification</span>
  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0"
    style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; margin: 0; padding: 0; width: 100%;"
    bgcolor="#f7f8f9">
    <tr>
      <td align="center"
        style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; word-break: break-word;">
        <table class="email-content" width="100%" cellpadding="0" cellspacing="0"
          style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; margin: 0; padding: 0; width: 100%;">
          <tr style="background: #fff;">
            <td height="40" class="em_height">&nbsp;</td>
          </tr> <!-- HEADER 1 -->
          <tr style="background: #fff;">
            <td align="center"> <a href="#" target="_blank" style="text-decoration:none;"><img
                  src="https://eximchain.com/token-verification.png" width="230" height="auto"
                  style="display:block; margin-bottom: 25px;" border="0" alt="Eximchain" /></a>
              <h2
                style="font-size: 1.2em; font-weight: normal; margin-top: -10px; margin-bottom: 0.809em; color: #515762;">
                DappBot Trial</h2>
            </td>
          </tr>
          <tr style="background: #fff;">
            <td height="30" class="em_height">&nbsp;</td>
          </tr>
          <tr>
            <td class="email-body" width="100%" cellpadding="0" cellspacing="0"
              style="-premailer-cellpadding: 0; -premailer-cellspacing: 0; border-bottom-color: #EDEFF2; border-bottom-style: solid; border-bottom-width: 1px; border-top-color: #EDEFF2; border-top-style: solid; border-top-width: 1px; box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; margin: 0; padding: 0; width: 100%; word-break: break-word; border-top: 4px solid #267edc;"
              bgcolor="#FFFFFF">
              <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0"
                style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; margin: 0 auto; padding: 0; width: 570px;"
                bgcolor="#FFFFFF">
                <tr>
                  <td class="content-cell"
                    style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; padding: 35px; word-break: break-word;">
                    <!-- ACTUAL CONTENT BEGINS HERE -->
                    <!-- HEADER 2 -->
                    <h1
                      style="box-sizing: border-box; color: #2b333f; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 19px; font-weight: bold; margin-top: 0;"
                      align="left">Your DappBot trial expires in 3 days!</h1> <!-- BODY -->
                    <p style="box-sizing: border-box; color: #626b76; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; line-height: 1.5em; margin-top: 0;"
                      align="left">
                      Your DappBot trial is almost over.   
                      I hope you’ve had a chance to create and deploy your blockchain application with DappBot. 
                      Here are some of DappBot’s powerful features that you might have missed:
                    </p>
                    <ul style="box-sizing: border-box; color: #626b76; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; line-height: 1.5em; margin-top: 0;">
                      <li style="box-sizing: border-box; color: #626b76; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; line-height: 1.5em; margin-top: 0;">
                        <strong>Speed:</strong> Save thousands of hours in prototyping your first blockchain application and ongoing DevOps effort – it takes only 3 steps in 5 minutes.
                      </li>
                      <li style="box-sizing: border-box; color: #626b76; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; line-height: 1.5em; margin-top: 0;">
                        <strong>Scalability:</strong> Eliminate all scaling concerns by instantly deploying your blockchain application to 165 hosts around the world.
                      </li>
                      <li style="box-sizing: border-box; color: #626b76; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; line-height: 1.5em; margin-top: 0;">
                        <strong>Simplicity:</strong> Simplify your ongoing development experience by deploying via GitHub branches, just like working with Pages (Coming Soon).
                      </li>
                    </ul>
                    <!-- TODO: Add <ul> for list of features... Copy that style tag everywhere.  -->
                    <p style="box-sizing: border-box; color: #626b76; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; line-height: 1.5em; margin-top: 0;"
                      align="left"> 
                      Let us know what you think about the DappBot experience, we would like to hear from you! 
                      Please help us with a 
                      <a href="https://imgflip.com/i/37koyd"
                          style="box-sizing: border-box; color: #3869D4; font-family: 'Helvetica Neue', Helvetica, sans-serif;">
                        short survey</a>
                      (less than 5 mins). 
                      Upon completing the survey, we will extend your trial access for an additional 14 days. Your feedback is valuable to us.  
                    </p>
                    <p style="box-sizing: border-box; color: #626b76; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; line-height: 1.5em; margin-top: 0;"
                      align="left">
                      Please
                      <a href="${managerDNS}/home/user-settings"
                        style="box-sizing: border-box; color: #3869D4; font-family: 'Helvetica Neue', Helvetica, sans-serif;">
                        subscribe</a>
                      before your trial ends to ensure you don't lose access.
                    </p>
                    <!-- SIGNATURE -->
                    <p style="box-sizing: border-box; color: #626b76; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; line-height: 1.5em; margin-top: 0;"
                      align="left">Cheers, <br />The DappBot Team at Eximchain</p>
                    <p style="box-sizing: border-box; color: #626b76; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; line-height: 1.5em; margin-top: 0;"
                      align="left"><strong
                        style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif;">P.S.</strong>
                      Please do not reply to this email. This email is generated automatically, and is not monitored for
                      responses. We will never ask you to send sensitive information via email or via a link in an
                      email.</p>
                    <table class="body-sub"
                      style="border-top-color: #EDEFF2; border-top-style: solid; border-top-width: 1px; box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; margin-top: 25px; padding-top: 25px;">
                      <tr>
                        <td
                          style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; word-break: break-word;">
                          <p class="sub"
                            style="box-sizing: border-box; color: #626b76; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;"
                            align="left">If any issues arise, please reach out for support at our <a
                              href="https://eximchain.zendesk.com/"
                              style="box-sizing: border-box; color: #3869D4; font-family: 'Helvetica Neue', Helvetica, sans-serif;">help
                              center.</a></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr> <!-- FOOTER -->
          <tr>
            <td
              style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; word-break: break-word; background: white;">
              <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0"
                style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; margin: 0 auto; padding: 0; text-align: center; width: 570px;">
                <tr>
                  <td class="content-cell" align="center"
                    style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; padding: 35px; word-break: break-word;">
                    <p class="sub align-center"
                      style="box-sizing: border-box; color: #AEAEAE; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;"
                      align="center">© 2018 Eximchain. All rights reserved.</p>
                    <p class="sub align-center"
                      style="box-sizing: border-box; color: #AEAEAE; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;"
                      align="center"> Eximchain <br />#02-00, 22 North Canal Road <br />Singapore 048834 </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>

</html>
  `
}