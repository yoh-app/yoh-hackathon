import prisma from 'admin/src/server/context/prisma'
export default async function requestClick(req, res) {
  // const { ip, slug } = req.body
  const { slug } = req.body
  await prisma.requestClick.create({
    data: {
      // ip,
      page: {
        connect: {
          slug
        }
      }
    }
  })
  res.send(200)
}