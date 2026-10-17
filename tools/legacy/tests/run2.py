import asyncio, random
from playwright.async_api import async_playwright
D='/tmp/claude-0/-home-claude/d78743a1-6a1d-564d-bbd8-066f6fc59d0d/scratchpad/'
URL='file://'+D+'test.html'
async def run(p, w, h, tag, mobile, chapters, blood_at):
    b=await p.chromium.launch(executable_path='/opt/google/chrome/chrome',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
    ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=2 if mobile else 1,has_touch=mobile,is_mobile=mobile)
    pg=await ctx.new_page();errs=[]
    pg.on('console',lambda m: errs.append(f'{m.type}: {m.text}') if m.type in('error','warning') else None)
    pg.on('pageerror',lambda e: errs.append(f'PAGEERROR: {e}'))
    await pg.goto(URL);await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(600)
    for f in chapters:
        await pg.evaluate(f"window.__t.start('normal',{f})");await pg.wait_for_timeout(2400)
        cx,cy=w/2,h*0.5
        random.seed(f)
        await (pg.touchscreen.tap(cx,cy) if mobile else pg.mouse.click(cx,cy))
        await pg.wait_for_timeout(500)
        for k in range(6):
            x=cx+random.uniform(-120,120);y=cy+random.uniform(-120,120)
            st=await pg.evaluate(f"(()=>{{const G=window.__t.G();return G.dead||G.over}})()")
            if st: break
            await (pg.touchscreen.tap(x,y) if mobile else pg.mouse.click(x,y))
            await pg.wait_for_timeout(180)
        if not mobile: await pg.mouse.move(cx-90,cy+70)
        if f==blood_at:
            await pg.evaluate("window.__t.G().hp=100");await pg.evaluate("window.__t.boom()")
            await pg.wait_for_timeout(1300)
        else:
            await pg.wait_for_timeout(3800)
        await pg.screenshot(path=D+f'shots/{tag}_ch{f}.png')
    print(tag,'errors:',errs[:12])
    await b.close()
async def main():
    async with async_playwright() as p:
        await run(p,1440,900,'d',False,[3],0)
        await run(p,390,844,'m',True,[3],3)
asyncio.run(main())
