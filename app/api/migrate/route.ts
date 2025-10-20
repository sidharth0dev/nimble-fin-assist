import { promisify } from 'node:util'
import { exec as execCb } from 'node:child_process'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const exec = promisify(execCb)

export async function GET() {
  try {
    const { stdout, stderr } = await exec('npx prisma migrate deploy')

    console.log('[migrate] stdout:', stdout)
    if (stderr) {
      console.warn('[migrate] stderr:', stderr)
    }

    return Response.json({
      ok: true,
      message: 'Prisma migrations deployed successfully.',
      stdout: stdout?.slice(0, 4000),
      stderr: stderr?.slice(0, 4000)
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[migrate] error:', message)
    return Response.json({ ok: false, message }, { status: 500 })
  }
}


