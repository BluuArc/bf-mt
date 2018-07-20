<template>
  <svg
    class="buff-icon"
    :width="width" :height="height"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink">
    <title v-text="iconKey"/>
    <image
      v-if="battleBuffIconKeys.includes(iconKey)"
      width="480" height="416"
      xlink:href="@/assets/buff-translation/battle/battle_buff_icon.png"
      :transform="`translate(${getBattleBuffIconCoordinates(battleBuffIconKeys.indexOf(iconKey))})`"/>
    <image
      v-else-if="sgBattleBuffIconKeys.includes(iconKey)"
      width="480" height="192"
      xlink:href="@/assets/buff-translation/battle/battle_buff_icon_sg.png"
      :transform="`translate(${getBattleBuffIconCoordinates(sgBattleBuffIconKeys.indexOf(iconKey), iconKey)})`"/>
    <image
      v-else-if="iconKey === iconKeyMapping.ST_ATK.name || iconKey === iconKeyMapping.ATK.name"
      width="30" height="32"
      :xlink:href="iconKeyMapping.ATK.src"/>
    <template v-else-if="iconKey === iconKeyMapping.AOE_ATK.name">
      <image
        width="30" height="32"
        :xlink:href="iconKeyMapping.ATK.src"
        transform="translate(-5 0)"/>
      <image
        width="30" height="32"
        :xlink:href="iconKeyMapping.ATK.src"
        transform="translate(35 0) scale(-1 1)"/>
    </template>
    <template v-else-if="iconKey.startsWith('INSTANT') && battleBuffIconKeys.includes(getBattleBuffKeyFromInstantIconKey(iconKey))">
      <image
        width="480" height="416"
        xlink:href="@/assets/buff-translation/battle/battle_buff_icon.png"
        :transform="`translate(${getBattleBuffIconCoordinates(battleBuffIconKeys.indexOf(getBattleBuffKeyFromInstantIconKey(iconKey)))})`"/>
      <g class="animate--pulse">
        <rect x="0" y="0" width="32" height="32" rx="8" ry="8" fill="grey" style="fill-opacity: 0.5"/>
        <text x="4" y="30" font-family="Consolas" font-size="3rem" font-weight="bold" fill="white" stroke="black" stroke-width="2px">B</text>
      </g>
    </template>
    <template v-else-if="iconKey === iconKeyMapping.PASSIVE_BUFF_HPRECTURNSTART.name">
      <image
        width="480" height="416"
        xlink:href="@/assets/buff-translation/battle/battle_buff_icon.png"
        :transform="`translate(${getBattleBuffIconCoordinates(battleBuffIconKeys.indexOf(iconKeyMapping.BUFF_HPREC.name))})`"/>
      <image
        width="36" height="36"
        xlink:href="@/assets/buff-translation/raid/raid_room_time.png"
        x="24" y="0"
        transform="scale(0.55)"/>
    </template>
    <template v-else-if="iconKey === iconKeyMapping.PASSIVE_BUFF_BBRECTURNSTART.name">
      <image
        width="480" height="416"
        xlink:href="@/assets/buff-translation/battle/battle_buff_icon.png"
        :transform="`translate(${getBattleBuffIconCoordinates(battleBuffIconKeys.indexOf(iconKeyMapping.BUFF_BBREC.name))})`"/>
      <image
        width="36" height="36"
        xlink:href="@/assets/buff-translation/raid/raid_room_time.png"
        x="24" y="0"
        transform="scale(0.55)"/>
    </template>
    <template v-else>
      <image
        xlink:href="@/assets/item_frame_bg2.png"
        :width="width" :height="height"
        class="buff-background"/>
        <image
        xlink:href="@/assets/buff-translation/raid/raid_room_shadow_question.png"
        :width="width" :height="height"/>
    </template>

  </svg>
</template>

<script>
import IconKeyMapping from '@/store/instances/EffectProcessor/icon-key-mappings';

export default {
  props: {
    width: {
      type: Number,
      default: 32,
    },
    height: {
      type: Number,
      default: 32,
    },
    iconKey: {
      type: String,
    },
  },
  computed: {
    battleBuffIconKeys: () => [
      'BUFF_ATKUP',
      'BUFF_ATKDOWN',
      'BUFF_DEFUP',
      'BUFF_DEFDOWN',
      'BUFF_RECUP',
      'BUFF_RECDOWN',
      'BUFF_CRTRATEUP',
      'BUFF_HPREC',
      'BUFF_HCDROP',
      'BUFF_BCDROP',
      'BUFF_ITEMDROP',
      'BUFF_KOBLK',
      'BUFF_FIREATKUP',
      'BUFF_FIREDEFUP',
      'BUFF_FIRERECUP',
      'BUFF_WATERATKUP',
      'BUFF_WATERDEFUP',
      'BUFF_WATERRECUP',
      'BUFF_EARTHATKUP',
      'BUFF_EARTHDEFUP',
      'BUFF_EARTHRECUP',
      'BUFF_THUNDERATKUP',
      'BUFF_THUNDERDEFUP',
      'BUFF_THUNDERRECUP',
      'BUFF_LIGHTATKUP',
      'BUFF_LIGHTDEFUP',
      'BUFF_LIGHTRECUP',
      'BUFF_DARKATKUP',
      'BUFF_DARKDEFUP',
      'BUFF_DARKRECUP',
      'BUFF_FIREATKDOWN',
      'BUFF_FIREDEFDOWN',
      'BUFF_FIRERECDOWN',
      'BUFF_WATERATKDOWN',
      'BUFF_WATERDEFDOWN',
      'BUFF_WATERRECDOWN',
      'BUFF_EARTHATKDOWN',
      'BUFF_EARTHDEFDOWN',
      'BUFF_EARTHRECDOWN',
      'BUFF_THUNDERATKDOWN',
      'BUFF_THUNDERDEFDOWN',
      'BUFF_THUNDERRECDOWN',
      'BUFF_LIGHTATKDOWN',
      'BUFF_LIGHTDEFDOWN',
      'BUFF_LIGHTRECDOWN',
      'BUFF_DARKATKDOWN',
      'BUFF_DARKDEFDOWN',
      'BUFF_DARKRECDOWN',
      'BUFF_FIREDMGDOWN',
      'BUFF_WATERDMGDOWN',
      'BUFF_EARTHDMGDOWN',
      'BUFF_THUNDERDMGDOWN',
      'BUFF_LIGHDMGDOWN',
      'BUFF_DARKDMGDOWN',
      'BUFF_POISONBLK',
      'BUFF_WEAKBLK',
      'BUFF_SICKBLK',
      'BUFF_INJURYBLK',
      'BUFF_CURSEBLK',
      'BUFF_PARALYSISBLK',
      'BUFF_BBREC',
      'BUFF_DAMAGEBB',
      'BUFF_GETENEATT',
      'BUFF_REPENEATT',
      'BUFF_IGNOREDEF',
      'BUFF_DBLSTRIKE',
      'BUFF_HITUP',
      'BUFF_ADDFIRE',
      'BUFF_ADDWATER',
      'BUFF_ADDEARTH',
      'BUFF_ADDTHUNDER',
      'BUFF_ADDLIGHT',
      'BUFF_ADDDARK',
      'BUFF_DAMAGECUT',
      'BUFF_SPARKUP',
      'BUFF_SPARKHC',
      'BUFF_SPARKBC',
      'BUFF_SPARKITEM',
      'BUFF_DISABLELS',
      'BUFF_RAIDATKUP',
      'BUFF_RAIDDEFUP',
      'BUFF_RAIDRECUP',
      'BUFF_RAIDCRTUP',
      'BUFF_RAIDDMGDOWN',
      'BUFF_ATKDOWNLOCK',
      'BUFF_DEFDOWNLOCK',
      'BUFF_RECDOWNLOCK',
      'BUFF_ADDPOISON',
      'BUFF_ADDWEAK',
      'BUFF_ADDSICK',
      'BUFF_ADDINJURY',
      'BUFF_ADDCURSE',
      'BUFF_ADDPARA',
      'BUFF_SPARKABILITY',
      'BUFF_ACTIVEOD',
      'BUFF_TURNDMG',
      'BUFF_BBATKUP',
      'BUFF_COUNTERDAMAGE',
      'BUFF_ADDATKDOWN',
      'BUFF_ADDDEFDOWN',
      'BUFF_ADDRECDOWN',
      'BUFF_BBFILL',
      'BUFF_CRTUP',
      'BUFF_FIREDMGUP',
      'BUFF_WATERMDGUP',
      'BUFF_EARTHDMGUP',
      'BUFF_THUNDERDMGUP',
      'BUFF_LIGHTDMGUP',
      'BUFF_DARKDMGUP',
      'BUFF_POISIONCOUNTER',
      'BUFF_WEAKCOUNTER',
      'BUFF_SICKCOUNTER',
      'BUFF_INJCONTER',
      'BUFF_CURSECOUNTER',
      'BUFF_PARALYCOUNTER',
      'BUFF_KOBLOCK',
      'BUFF_HCDOWN',
      'BUFF_BCDOWN',
      'BUFF_SPARKDMGUP',
      'BUFF_BBATKDOWN',
      'BUFF_FIRESHIELD',
      'BUFF_WATERSHIELD',
      'BUFF_EARTHSHIELD',
      'BUFF_THUNDERSHIELD',
      'BUFF_LIGHTSHIELD',
      'BUFF_DARKSHIELD',
      'BUFF_AILDMGUP',
      'BUFF_SPARKBBUP',
      'BUFF_GUARDCUT',
      'BUFF_GUARDBBUP',
      'BUFF_GUARDPARAMUP',
      'BUFF_BBFILLDOWN',
      'BUFF_SPARKATKUP',
      'BUFF_SPARKDEFUP',
      'BUFF_SPARKRECUP',
      'BUFF_SPARKCRTUP',
      'BUFF_RESISTATKDOWN',
      'BUFF_RESISTDEFDOWN',
      'BUFF_RESISTRECDOWN',
      'BUFF_ATKUP2',
      'BUFF_DEFUP2',
      'BUFF_RECUP2',
      'BUFF_SPARKCRTACTIVATED',
      'BUFF_OVERDRIVEUP',
      'BUFF_BEENATK_HPREC',
      'BUFF_HPABS',
      'BUFF_SPARK_HPREC',
      'BUFF_ATKUP3',
      'BUFF_DEFUP3',
      'BUFF_RECUP3',
      'BUFF_CRTRATEUP2',
      'BUFF_SPARKDMGUP2',
      'BUFF_HPREC2',
      'BUFF_BBFILL2',
      'BUFF_ATKUP4',
      'BUFF_DEFUP4',
      'BUFF_RECUP4',
      'BUFF_CRTDOWN',
      'BUFF_ELEMENTDOWN',
      'BUFF_SPARKDMGDOWN',
      'BUFF_AOEATK',
      'BUFF_NULLSPHERE',
      'BUFF_NULLES',
      'BUFF_BBREDUC',
      'BUFF_ODFILLBOOST',
      'BUFF_ATKREDUC',
      'BUFF_TARGETED',
      'BUFF_PROB_ATKREDUC',
      'BUFF_PROB_DEFREDUC',
      'BUFF_PROB_RECREDUC',
      'BUFF_CRITDMG_VUL',
      'BUFF_ELEDMG_VUL',
      'BUFF_NULLITEM',
      'BUFF_NULLSWAP',
      'BUFF_FIRESHIELDDOWN',
      'BUFF_WATERSHIELDDOWN',
      'BUFF_EARTHSHIELDDOWN',
      'BUFF_THUNDERSHIELDDOWN',
      'BUFF_LIGHTSHIELDDOWN',
      'BUFF_DARKSHIELDDOWN',
    ],
    sgBattleBuffIconKeys: () => [
      'SG_BUFF_TAUNT',
      'SG_BUFF_STEALTH',
      'SG_BUFF_ALL',
      'SG_BUFF_FIRE',
      'SG_BUFF_WATER',
      'SG_BUFF_EARTH',
      'SG_BUFF_THUNDER',
      'SG_BUFF_LIGHT',
      'SG_BUFF_DARK',
      'SG_BUFF_SPHERE_DISABLE',
      'SG_BUFF_DMG_IMMUNINTY',
      'SG_BUFF_SKIP_TURN',
      'SG_BUFF_TIME_STOP',
      'SG_BUFF_EVASION',
      'SG_BUFF_CRTRATEDOWN',
      'SG_BUFF_FIRESHIELDDOWN',
      'SG_BUFF_WATERSHIELDDOWN',
      'SG_BUFF_EARTHSHIELDDOWN',
      'SG_BUFF_THUNDERSHIELDDOWN',
      'SG_BUFF_LIGHTSHIELDDOWN',
      'SG_BUFF_DARKSHIELDDOWN',
      'SG_BUFF_WEAKSHIELD',
      'SG_BUFF_DAMAGECUTDOWN',
      'SG_BUFF_ATK_EU',
      'SG_BUFF_DBLBB_EU',
      'SG_BUFF_REC_EU',
    ],
    iconKeyMapping: () => IconKeyMapping,
  },
  methods: {
    getBattleBuffIconCoordinates (index = 0, key) {
      const rowLength = 15;
      const y = Math.floor(index / rowLength);
      const x = index - (y * rowLength);
      console.debug(key, index, x, y);
      return [x, y].map(coord => coord * -32).join(' ');
    },
    getBattleBuffKeyFromInstantIconKey (instantKey = 'INSTANT_SOME_BUFF') {
      // eslint-disable-next-line no-unused-vars
      const [ instantPrefix, ...battleBuffIconKey ] = instantKey.split('_');
      return battleBuffIconKey.join('_');
    },
  },
};
</script>

<style>
.buff-icon image.buff-background {
  z-index: 1;
}

.buff-icon image:not(.buff-background) {
  z-index: 2;
}

.buff-icon .animate--pulse {
  animation-name: pulse;
  animation-duration: 1s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

@keyframes pulse {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>


