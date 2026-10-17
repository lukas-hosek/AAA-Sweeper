import asyncio
from playwright.async_api import async_playwright
D='/tmp/claude-0/-home-claude/d78743a1-6a1d-564d-bbd8-066f6fc59d0d/scratchpad/'
FONT="@font-face{font-family:Teko;font-weight:600;src:url('file://"+D+"fonts/package/files/teko-latin-600-normal.woff2') format('woff2')}"
async def run(p,w,h,tag,mobile,diff):
    b=await p.chromium.launch(executable_path='/opt/google/chrome/chrome',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
    ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=2 if mobile else 1,has_touch=mobile,is_mobile=mobile)
    pg=await ctx.new_page();errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)))
    await pg.goto('file://'+D+'test.html');await pg.add_style_tag(content=FONT);await pg.wait_for_timeout(800)
    await pg.evaluate(f"(()=>{{window.__t.start('{diff}',5);return 0}})()");await pg.wait_for_timeout(1500)
    await (pg.touchscreen.tap(w/2,h*.55) if mobile else pg.mouse.click(w/2,h*.55))
    await pg.wait_for_timeout(4200)
    await pg.screenshot(path=D+f'shots/o2_{tag}_cd.png')
    await pg.evaluate("(()=>{const G=window.__t.G();G.clock=G.floodStart+G.floodTotal-1;return 0})()")
    await pg.wait_for_timeout(4500)
    await pg.screenshot(path=D+f'shots/o2_{tag}_a.png')
    await pg.evaluate("(()=>{window.__t.G().bLog=-11.47;return 0})()");await pg.wait_for_timeout(500)
    await pg.screenshot(path=D+f'shots/o2_{tag}_b.png')
    r=await pg.evaluate("(()=>{const e=document.querySelector('#o2');const r=e.getBoundingClientRect();return [e.className,e.style.fontSize,Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]})()")
    print(tag,r,errs)
    await b.close()
async def main():
    async with async_playwright() as p:
        await run(p,1440,900,'w',False,'normal');await run(p,1000,760,'mid',False,'normal');await run(p,390,844,'n',True,'story');await run(p,1440,900,'wv',False,'veteran')
asyncio.run(main())
