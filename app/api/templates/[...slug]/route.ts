import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';


//migration to Next.js 15
type Params = Promise<{ slug: string }>

export async function GET(
    request: NextRequest,
    segmentData: { params: Params }
) {
    const { slug } = await segmentData.params;

    if (!Array.isArray(slug) || slug.length !== 2) {
        return NextResponse.json({ error: 'Invalid template path' }, { status: 400 });
    }

    const [tag, templateName] = slug;
    const templatePath = path.join(process.cwd(), 'templates', tag, `${templateName}.md`);

    try {
        const content = await fs.readFile(templatePath, 'utf-8');
        return NextResponse.json({ content });
    } catch (error) {
        console.error('Error reading template:', error);
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
}