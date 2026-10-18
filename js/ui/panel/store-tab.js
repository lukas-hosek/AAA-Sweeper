/**
 * store-tab.js: the store: premium flag skins, an XP boost, loot crates and a "real money" coin bundle.
 */
import {soundEffects} from '../../audio/sound-effects.js';
import {EscapeHtml} from '../../core/dom.js';
import {profile} from '../../core/player-profile.js';
import {FLAG_SKINS, STORE_ITEMS} from '../../data/store.js';
import {supplyDrop} from '../../game/events/supply-drop.js';
import {game} from '../../game/game.js';
import {achievements} from '../achievements.js';
import {banners} from '../banners.js';
import {hud} from '../hud.js';
import {toasts} from '../toasts.js';
import {PanelTab} from './panel-tab.js';


const BUNDLE_COINS = 1000;                  // The "€9.99" bundle, free of charge
const XP_BOOST_MS = 5 * 60 * 1000;
const PREMIUM_SKINS_FOR_QUEST = 3;          // Quartermaster Pryce's side quest: collect three premium flags
// Icons on the swatches of the items that aren't flags
const ITEM_ICONS = {boost: '×2', crate: '?', iap: '⛁'};


/**
 * Flags are bought once and can then be equipped for free; the rest are consumables. No real money is involved:
 * the bundle hands out coins. Every purchase unlocks the "whale" achievement.
 */
export class StoreTab extends PanelTab {
	constructor(panel) {
		super(panel, 'store', 'STORE');
	}


	Markup() {
		const equippedName = EscapeHtml(FLAG_SKINS[profile.equippedSkin].name);
		const items = STORE_ITEMS.map(item => this.#ItemCard(item)).join('');
		// The standard flag can't be bought, but once another one is equipped it can be equipped again
		const standardFlag = profile.equippedSkin === 'red' ? '' : `<div class="panel-card store-item">
				${this.#FlagSwatch(FLAG_SKINS.red)}
				<span class="card-name">Standard Flag</span>
				<span class="card-description">The flag you started with. Free, forever, probably.</span>
				<button class="panel-button is-secondary" data-equip="red">EQUIP</button>
			</div>`;
		return `<div class="panel-heading">Sweep coins: ${profile.coins.toLocaleString('en-US')}</div>
			<p class="panel-text">Earn coins by levelling up and opening supply drops. Or skip the grind. Equipped flag: ${equippedName}.</p>
			<div class="card-grid">${items}${standardFlag}</div>
			<p class="panel-text" style="margin-top:16px;font-size:11px;color:#71808a">*No real money is involved. This is a parody of real money.</p>`;
	}


	OnClick(button) {
		if (button.dataset.equip) {
			this.#Equip(button.dataset.equip);
		} else if (button.dataset.buy) {
			this.#Buy(STORE_ITEMS.find(item => item.id === button.dataset.buy));
		}
	}


	/** One item: swatch, name, description, price and BUY (or EQUIP / EQUIPPED for flags already owned). */
	#ItemCard(item) {
		const isOwned = item.type === 'skin' && profile.ownedSkins[item.id];
		const isEquipped = isOwned && profile.equippedSkin === item.id;
		const swatch = item.type === 'skin'
			? this.#FlagSwatch(FLAG_SKINS[item.id])
			: `<div class="store-swatch"><span style="font:600 26px var(--font-numbers);color:var(--gold-light)">${ITEM_ICONS[item.type]}</span></div>`;
		let button = `<button class="panel-button" data-buy="${item.id}">BUY</button>`;
		if (isEquipped) {
			button = '<button class="panel-button" disabled>EQUIPPED</button>';
		} else if (isOwned) {
			button = `<button class="panel-button is-secondary" data-equip="${item.id}">EQUIP</button>`;
		}
		const price = typeof item.price === 'number' ? `<span class="coin"></span>${item.price}` : EscapeHtml(item.price);
		return `<div class="panel-card store-item">
				${swatch}
				<span class="card-name">${EscapeHtml(item.name)}</span>
				<span class="card-description">${EscapeHtml(item.description)}</span>
				<span class="store-price">${price}</span>
				${button}
			</div>`;
	}


	/** A little flag on a pole, in the skin's colours. */
	#FlagSwatch(skin) {
		return '<div class="store-swatch"><svg viewBox="0 0 40 48">'
			+ '<rect x="10" y="6" width="3" height="36" fill="#1b2127"/><rect x="5" y="42" width="18" height="4" fill="#0c0f12"/>'
			+ `<path d="M13 6 L36 13 L13 20 Z" fill="${skin.fillColor}" stroke="${skin.outlineColor}" stroke-width="2"/>`
			+ '</svg></div>';
	}


	#Equip(skinId) {
		profile.equippedSkin = skinId;
		profile.Save();
		soundEffects.Flag();
		if (profile.equippedSkin === 'tune') {
			soundEffects.FlagTune();
		}
		hud.Refresh();
		this.panel.Render();
	}


	#Buy(item) {
		if (item.type === 'iap') {
			profile.coins += BUNDLE_COINS;
			profile.Save();
			soundEffects.Coin();
			achievements.Unlock('whale');
			toasts.Show({
				kicker: 'PURCHASE COMPLETE',
				title: '€0.00 charged',
				description: 'This is a parody. Enjoy 1,000 coins anyway.',
				isReward: true,
				icon: '⛁',
			});
			this.panel.Render();
			hud.Refresh();
			return;
		}
		if (profile.coins < item.price) {
			soundEffects.Denied();
			toasts.Show({kicker: 'NOT ENOUGH SWEEP COINS', title: 'Level up, open supply drops, or buy the 1,000 coin bundle.', icon: '!'});
			return;
		}
		profile.coins -= item.price;
		soundEffects.Coin();
		achievements.Unlock('whale');
		if (item.type === 'skin') {
			this.#ReceiveSkin(item);
		} else if (item.type === 'boost') {
			profile.xpBoostUntil = Math.max(Date.now(), profile.xpBoostUntil) + XP_BOOST_MS;
			toasts.Show({kicker: 'XP BOOST ACTIVE', title: 'Double XP for 5 minutes', isReward: true, icon: '×2'});
		} else if (item.type === 'crate') {
			supplyDrop.RollLoot();
		}
		profile.Save();
		hud.Refresh();
		this.panel.Render();
	}


	/** A bought flag is equipped at once. Three premium flags complete the Quartermaster's side quest. */
	#ReceiveSkin(item) {
		profile.ownedSkins[item.id] = true;
		profile.equippedSkin = item.id;
		if (item.id === 'tune') {
			soundEffects.FlagTune();
		}
		toasts.Show({
			kicker: 'PURCHASED',
			title: item.name,
			description: 'Equipped. Same hitbox. Feels better.',
			isReward: true,
			icon: '⚑',
		});
		const field = game.field;
		if (profile.CountPremiumSkins() >= PREMIUM_SKINS_FOR_QUEST && field && field.sideQuests.includes('qm')) {
			banners.Show('QUEST COMPLETE', 'Premium Flag Collector', 'The Quartermaster is proud of you', '#4fd8ff');
		}
	}
}
