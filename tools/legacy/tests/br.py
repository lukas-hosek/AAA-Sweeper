import asyncio
from playwright.async_api import async_playwright
D='/tmp/claude-0/-home-claude/d78743a1-6a1d-564d-bbd8-066f6fc59d0d/scratchpad/'
async def run(p,w,h,tag,mobile):
    b=await p.chromium.launch(executable_path='/opt/google/chrome/chrome',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
    ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=2 if mobile else 1,has_touch=mobile,is_mobile=mobile)
    pg=await ctx.new_page();errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)))
    await pg.goto('file://'+D+'test.html');await pg.wait_for_timeout(800)
    await pg.evaluate("(()=>{window.__t.start('story',5);return 0})()");await pg.wait_for_timeout(1500)
    await (pg.touchscreen.tap(w/2,h/2) if mobile else pg.mouse.click(w/2,h/2))
    await pg.evaluate("(()=>{const G=window.__t.G();G.clock=G.floodStart+G.floodTotal-1;return 0})()")
    await pg.wait_for_timeout(5000)
    a=await pg.evaluate("(()=>{const G=window.__t.G();return [G.flooded,G.bLog,G.breath]})()")
    await pg.evaluate("(()=>{window.__t.G().bLog=-11.47;return 0})()");await pg.wait_for_timeout(600)
    await pg.screenshot(path=D+f'shots/br_{tag}.png')
    print(tag,a,errs)
    await b.close()
async def main():
    async with async_playwright() as p:
        await run(p,1440,900,'d',False);await run(p,390,844,'m',True)
asyncio.run(main())
