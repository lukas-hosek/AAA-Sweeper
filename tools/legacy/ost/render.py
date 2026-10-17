import asyncio, math, json, sys
from playwright.async_api import async_playwright
D='/tmp/claude-0/-home-claude/d78743a1-6a1d-564d-bbd8-066f6fc59d0d/scratchpad/'
STEP={'title':60/72/2,'game':60/100/4,'club':60/124/4,'win':60/76/2,'desert':60/92/4,'credits':60/68/2,'arctic':60/66/2,'home':60/88/2,'pathos':60/62/2}
CYC={'title':32,'game':128,'club':128,'desert':128,'arctic':64,'home':64,'pathos':128,'credits':192,'win':32}
modes=sys.argv[1:] or list(CYC)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/opt/google/chrome/chrome',args=['--no-sandbox'])
        ctx=await b.new_context(accept_downloads=True);pg=await ctx.new_page();errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+D+'ost/render.html');await pg.wait_for_timeout(500)
        res={}
        for m in modes:
            cyc=CYC[m]*STEP[m];loops=max(2,math.ceil(100/cyc));n=CYC[m]*loops
            async with pg.expect_download(timeout=600000) as dl:
                r=await pg.evaluate(f"window.__render('{m}',{n},10)")
            d=await dl.value;await d.save_as(D+f'ost/{m}.wav')
            res[m]=dict(r,loops=loops,cycle=round(cyc,2));print(m,res[m],flush=True)
        print(errs)
        await b.close()
asyncio.run(main())
