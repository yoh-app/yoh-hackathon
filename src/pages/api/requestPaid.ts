import prisma from 'admin/src/server/context/prisma'
import paidRequestEmail from 'admin/src/magic/utils/emailTemplates/paidRequest';

import { useLocale } from 'admin/src/utils/mailLocales';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function requestPaid(req, res) {
  const { requestId, transactionHash, walletAddress } = req.body

  const requestItem = await prisma.request.findUnique({
    where: {
      id: requestId,
    },
  })
  const expiredDate = new Date(Date.now() + requestItem.days * 24 * 60 * 60 * 1000);

  const request = await prisma.request.update({
    where: {
      id: requestId
    },
    data: {
      walletAddress: { set: walletAddress },
      requestStatus: { set: 'active' },
      transactionHash,
      expiredAt: { set: expiredDate.toISOString() },
      paidAt: { set: new Date().toISOString() }
    },
    include: {
      page: {
        include: {
          website: {
            include: {
              user: true
            }
          }
        }
      },
      customer: {
        include: {
          user: true
        }
      }
    }
  })

  const translator = useLocale(request.page.website.languageCode);

  const paidRequestEmailHtml = paidRequestEmail(request, translator);

  const emailConfig = {
    to: request.page?.website?.user?.email,
    from: {
      email: process.env.EMAIL_FROM,
      name: process.env.EMAIL_FROMNAME,
    },
    subject: translator['WebsiteAdmin.Mail.NewRequest.paid'],
    html: paidRequestEmailHtml
  };
  await sgMail.send(emailConfig)
  const notification = await prisma.notification.create({
    data: {
      model: 'Request',
      modelId: request.id,
      title: 'Request',
      description: `Request ${request.name} paid`,
      url: `/admin/User/Request/Request?view=${request.id}`,
      action: 'view',
      isUnRead: true,
      website: {
        connect: {
          id: request.page.website.id
        }
      }
    }
  })

  res.send(200)
}