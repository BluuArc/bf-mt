<template>
  <module-checker
    :requiredModules="requiredModules"
    :ensureDbSync="true">
    <v-container>
      <v-layout justify-center>
        <v-flex xs12 v-if="!editMode">
          <squad-list-card
            :squad="squad"
            :getUnit="getUnit"
            :getItem="getItem"
            :getExtraSkill="getExtraSkill"
            :isLoadingInParent="isLoadingSquadData"
          >
            <v-card-actions slot="card-actions" slot-scope="{ disabled }">
              <v-btn
                flat
                :icon="minimizeSquadActionButtons"
                :disabled="disabled"
                @click="editMode = true">
                <v-icon :left="!minimizeSquadActionButtons">edit</v-icon>
                <span v-if="!minimizeSquadActionButtons">
                  Edit
                </span>
              </v-btn>
              <v-btn
                flat
                :icon="minimizeSquadActionButtons"
                :disabled="disabled"
                @click="activeSquadDialog = 'share'">
                <v-icon :left="!minimizeSquadActionButtons">share</v-icon>
                <span v-if="!minimizeSquadActionButtons">
                  Share
                </span>
              </v-btn>
              <v-btn
                v-if="squadCode"
                flat
                :icon="minimizeSquadActionButtons"
                :disabled="disabled"
                :to="getSquadUrl(squadCode)">
                <v-icon :left="!minimizeSquadActionButtons">file_copy</v-icon>
                <span v-if="!minimizeSquadActionButtons">
                  Copy
                </span>
              </v-btn>
              <v-spacer/>
              <v-btn
                flat
                :icon="minimizeSquadActionButtons"
                :disabled="disabled"
                @click="activeSquadDialog = 'delete'">
                <v-icon :left="!minimizeSquadActionButtons">delete</v-icon>
                <span v-if="!minimizeSquadActionButtons">
                  Delete
                </span>
              </v-btn>
            </v-card-actions>
          </squad-list-card>
        </v-flex>
        <v-flex xs12 v-else>
          <squad-list-card-editable
            :squad="tempSquad"
            :squadId="id"
            :getUnit="getUnit"
            :getItem="getItem"
            :getExtraSkill="getExtraSkill"
            :redirectOnCancel="false"
            :isLoadingInParent="isLoadingSquadData"
            @newsquad="$sq => tempSquad = $sq"
            @newunits="onNewUnits"
            @save="() => { squad = tempSquad; editMode = false; }"
            @cancel="editMode = false"
          />
        </v-flex>
      </v-layout>
      <v-flex xs12>
        <v-divider class="mt-2"/>
      </v-flex>
      <v-flex xs12>
        <v-card>
          <tab-container
            v-if="!isLoadingSquadData && !editMode"
            v-model="currentTabIndex"
            class="mt-2"
            :tabs="tabConfig">
            <v-layout slot="squad-buffs">
              <dl>
                <dt>Party Passives</dt>
                <dd>table here</dd>

                <dt>Party Buffs</dt>
                <dd>table here</dd>

                <dt>For the Enemy</dt>
                <dd>table here</dd>
              </dl>
            </v-layout>
            <v-layout slot="unit-buffs">
              <dl>
                <dt>Self Passives</dt>
                <dd>table here</dd>

                <dt>Self Buffs</dt>
                <dd>table here</dd>
              </dl>
            </v-layout>
            <v-layout slot="spark-statistics">
              Spark stats go here
            </v-layout>
            <v-layout slot="arena">
              Arena suggestions go here
            </v-layout>
          </tab-container>
        </v-card>
      </v-flex>
      <v-dialog
        :value="!!activeSquadDialog"
        @input="$v => activeSquadDialog = $v ? activeSquadDialog : ''"
        lazy>
        <template v-if="squadCode">
          <share-squad-card
            v-if="activeSquadDialog === 'share'"
            :squad="squad"
            :getUnit="getUnit"
            :getItem="getItem"
            :getExtraSkill="getExtraSkill"
            @back="activeSquadDialog = ''"/>
          <delete-squad-card
            v-else-if="activeSquadDialog === 'delete'"
            :squad="squad"
            :squadId="+id"
            :getUnit="getUnit"
            :getItem="getItem"
            :getExtraSkill="getExtraSkill"
            @delete="$router.push('/tools/squads')"
            @cancel="activeSquadDialog = ''"/>
        </template>
        <v-card v-else>
          <v-card-text>
            No squad selected
          </v-card-text>
          <v-card-actions style="justify-content: flex-end">
            <v-btn flat @click="activeSquadDialog = ''">
              Back
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </module-checker>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { squadRequiredModules } from '@/router/tool-routes';
import { Logger } from '@/modules/Logger';
import {
  squadToShorthand,
  getMultidexDatabaseIdsFromSquads,
  cloneSquad,
  getEffectsFromSquadUnitEntry,
} from '@/modules/core/squads';
import { burstTypes, targetTypes, squadBuffTypes, squadUnitActions } from '@/modules/constants';
import { getEffectId } from '@/modules/EffectProcessor/processor-helper';
import ModuleChecker from '@/components/ModuleChecker';
import LoadingIndicator from '@/components/LoadingIndicator';
import SquadListCard from '@/components/Tools/Squads/SquadListCard';
import ShareSquadCard from '@/components/Tools/Squads/ShareSquadCard';
import DeleteSquadCard from '@/components/Tools/Squads/DeleteSquadCard';
import TabContainer from '@/components/CardTabsContainer';
import SquadListCardEditable from '@/components/Tools/Squads/SquadListCardEditable';

const logger = new Logger({ prefix: '[Squad]' });
export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  components: {
    ModuleChecker,
    SquadListCard,
    ShareSquadCard,
    DeleteSquadCard,
    TabContainer,
    SquadListCardEditable,
    LoadingIndicator,
  },
  computed: {
    ...mapState('settings', ['activeServer']),
    requiredModules: () => squadRequiredModules,
    tabConfig: () => [
      'Squad Buffs',
      'Unit Buffs',
      'Spark Statistics',
      'Arena',
    ].map(name => ({ name, slot: name.toLowerCase().replace(/ /g, '-') })),
    squadCode () {
      return this.squad ? squadToShorthand(this.squad) : '';
    },
    minimizeSquadActionButtons () {
      return this.$vuetify.breakpoint.xsOnly;
    },
  },
  data () {
    return {
      squad: null,
      squadUnits: {},
      squadItems: {},
      squadExtraSkills: {},
      isLoadingSquadData: false,
      activeSquadDialog: '',
      editMode: false,
      currentTabIndex: 0,
      tempSquad: {},
    };
  },
  mounted () {
    this.isLoadingSquadData = true;
    this.$store.dispatch('squads/getSquadById', this.id)
      .then(result => {
        this.squad = result.squad;
      });
  },
  methods: {
    ...mapActions('units', {
      getUnits: 'getByIds',
    }),
    ...mapActions('items', {
      getItems: 'getByIds',
    }),
    ...mapActions('extraSkills', {
      getExtraSkills: 'getByIds',
    }),
    getUnit (id) {
      return this.squadUnits[id] || {};
    },
    getItem (id) {
      return this.squadItems[id] || {};
    },
    getExtraSkill (id) {
      return this.squadExtraSkills[id] || {};
    },
    async updatePageDbForSquad (squad) {
      if (squad) {
        const databaseIds = getMultidexDatabaseIdsFromSquads(squad);
        const toLowerCase = (input) => `${input[0].toLowerCase()}${input.slice(1)}`;
        const currentServer = this.activeServer;
        try {
          await ['Units', 'Items', 'ExtraSkills'].reduce((acc, name) => {
            const entriesToGet = [];
            const componentDb = this[`squad${name}`];
            const neededKeys = databaseIds[toLowerCase(name)];
            const newDb = {};
            const allKeys = Object.keys(componentDb).map(id => +id).concat(neededKeys);
            allKeys.forEach((id) => {
              if (!isNaN(id) && neededKeys.includes(id)) {
                if (!componentDb[id]) {
                  entriesToGet.push(id);
                } else {
                  newDb[id] = componentDb[id];
                }
              }
            });
  
            return acc.then(async () => {
              if (entriesToGet.length > 0) {
                if (!this.isLoadingSquadData) {
                  this.isLoadingSquadData = true;
                }
                const retrievedEntries = await this[`get${name}`]({
                  ids: entriesToGet,
                  server: currentServer,
                  extractedFields: [],
                });
                this[`squad${name}`] = Object.freeze({ ...newDb, ...retrievedEntries });
              } else {
                this[`squad${name}`] = Object.freeze(newDb);
              }
            });
          }, Promise.resolve());
        } catch (err) {
          logger.error(err);
        } finally {
          this.isLoadingSquadData = false;
        }
      }
    },
    setDocumentTitle () {
      const defaultTitle = 'BF-MT - Squad';
      if (this.squad && this.squad.name) {
        document.title = [defaultTitle, this.squad.name].join(' - ');
      } else {
        document.title = defaultTitle;
      }
    },
    getSquadUrl (squad) {
      return this.$router.resolve({
        path: '/tools/squads/add',
        query: { import: typeof squad !== 'string' ? squadToShorthand(squad) : squad },
      }).route.fullPath;
    },
    onNewUnits (units) {
      this.tempSquad = { ...this.tempSquad, units };
    },
    /* eslint-disable */
    getEffectMappingForSquadUnitEntry (entry, target, type) {
      const entryEffects = getEffectsFromSquadUnitEntry(entry, this);
      const extractBuffsFromTriggeredEffect = (effect = {}, sourcePath) => Array.isArray(effect['triggered effect'])
        ? Array.from(effect['triggered effect']).map(e => ({ ...e, sourcePath }))
        : [];
      const extractBuffsFromEffects = (effects = []) => effects.map(e => extractBuffsFromTriggeredEffect(e, e.sourcePath))
        .filter(e => e.length > 0)
        .reduce((acc, arr) => acc.concat(arr), []);
      const NON_UBB_ACTIONS = Object.freeze([squadUnitActions.BB, squadUnitActions.SBB]);

      let aggregatedEffects = [];
      if (target === targetTypes.PARTY) {
        const isLsActive = (this.squad.units.indexOf(entry) === this.squad.lead || this.squad.units.indexOf(entry) === this.squad.friend);
        const filteredEffects = {
          unitEs: [],
          unitSp: [],
          unitLs: [],
          elgif: [],
          spheres: [],
          unitNonUbb: [],
          unitUbb: [],
        };
        if (type === squadBuffTypes.PASSIVE) {
          // no spheres as sphere passives only effect current unit
          if (isLsActive) {
            filteredEffects.unitLs = entryEffects.unit.ls;
            filteredEffects.unitSp = entryEffects.unit.sp.filter(e => e.sp_type === 'add to passive'); // add to LS
          }
          filteredEffects.unitEs = entryEffects.unit.es.filter(e => e['passive target'] === targetTypes.PARTY);
          filteredEffects.elgif = entryEffects.es.filter(e => e['passive target'] === targetTypes.PARTY);
        } else if (type === squadBuffTypes.BUFF) {
          const processExtraSkill = (esEffects = []) => {
            esEffects.forEach(esEffect => {
              const buffs = extractBuffsFromTriggeredEffect(esEffect, esEffect.sourcePath)
                .filter(e => e['target type'] === targetTypes.PARTY)
                .map(e => ({ ...e, esConditions: esEffect.conditions }));
              if (esEffect['trigger on ubb'] && buffs.length > 0) {
                filteredEffects.unitUbb = filteredEffects.unitUbb.concat(buffs.map(b => ({
                  ...b,
                  ['trigger on ubb']: esEffect['trigger on ubb'],
                })));
              }
              if ((esEffect['trigger on bb'] || esEffect['trigger on sbb']) && buffs.length > 0) {
                NON_UBB_ACTIONS
                  .filter(t => esEffect[`trigger on ${t}`])
                  .forEach(t => {
                    filteredEffects.unitNonUbb = filteredEffects.unitNonUbb.concat(buffs.map(b => ({
                      ...b,
                      [`trigger on ${t}`]: esEffect[`trigger on ${t}`],
                    })));
                  });
              }
            });
          };
          if (isLsActive) {
            filteredEffects.unitLs = extractBuffsFromEffects(entryEffects.unit.ls);
          }
          processExtraSkill(entryEffects.unit.es);

          burstTypes.forEach(burstType => {
            const burstEffects = entryEffects.unit[burstType].filter(e => e['target type'] === targetTypes.PARTY);
            if (burstType !== squadUnitActions.UBB) {
              filteredEffects.unitNonUbb = filteredEffects.unitNonUbb.concat(burstEffects);
            } else {
              filteredEffects.unitUbb = filteredEffects.unitUbb.concat(burstEffects);
            }
          });

          // assumption: SP entries are in order so upgrades to previous enhancements are closer to the end of the array
          entryEffects.unit.sp.forEach(spEffect => {
            const removeOldSpOptions = (currentArr = [], spToRemove = []) => currentArr.filter(e => !spToRemove.includes(e));
            if (spEffect['triggered effect']) {
              const buffs = extractBuffsFromTriggeredEffect(spEffect, spEffect.sourcePath)
                .filter(triggeredEffect => triggeredEffect['target type'] === targetTypes.PARTY)
                .map(e => {
                  const carriedKeys = burstTypes.map(t => `trigger on ${t}`).concat(['sp_type']);
                  const carriedProperties = carriedKeys.reduce((acc, key) => {
                    if (spEffect[key]) {
                      acc[key] = spEffect[key];
                    }
                    return acc;
                  }, {})
                  return ({ ...e, ...carriedProperties });
                });

              let existingSpBuffs;
              if (spEffect['trigger on ubb'] && buffs.length > 0) {
                existingSpBuffs = filteredEffects.unitUbb.filter(e => e['proc id'] === spEffect['proc id'] || e['unknown proc id'] === spEffect['unknown proc id'] && e.sp_type === spEffect.sp_type);
                if (existingSpBuffs) { // remove old one, as current one will replace it
                  filteredEffects.unitUbb = removeOldSpOptions(filteredEffects.unitUbb, existingSpBuffs);
                }
                filteredEffects.unitUbb = filteredEffects.unitUbb.concat(buffs.map(b => ({
                  ...b,
                  ['trigger on ubb']: spEffect['trigger on ubb'],
                })));
              }
              if ((spEffect['trigger on bb'] || spEffect['trigger on sbb']) && buffs.length > 0) {
                existingSpBuffs = filteredEffects.unitNonUbb.filter(e => e['proc id'] === spEffect['proc id'] || e['unknown proc id'] === spEffect['unknown proc id'] && e.sp_type === spEffect.sp_type);
                if (existingSpBuffs) { // remove old one, as current one will replace it
                  filteredEffects.unitNonUbb = removeOldSpOptions(filteredEffects.unitNonUbb, existingSpBuffs);
                }
                NON_UBB_ACTIONS
                  .filter(t => spEffect[`trigger on ${t}`])
                  .forEach(t => {
                    filteredEffects.unitNonUbb = filteredEffects.unitNonUbb.concat(buffs.map(b => ({
                      ...b,
                      [`trigger on ${t}`]: spEffect[`trigger on ${t}`],
                    })));
                  });
              }
            } else if (spEffect.sp_type === 'add to bb' || spEffect.sp_type === 'add to sbb') {
              // only add burst enhancements if they are already included
              const existingBuff = filteredEffects.unitNonUbb.find(e => e['proc id'] === spEffect['proc id'] || e['unknown proc id'] === spEffect['unknown proc id']);
              if (existingBuff) {
                const existingSpBuffs = filteredEffects.unitNonUbb.filter(e => e['proc id'] === spEffect['proc id'] || e['unknown proc id'] === spEffect['unknown proc id'] && e.sp_type === spEffect.sp_type);
                if (existingSpBuffs) { // remove old one, as current one will replace it
                  filteredEffects.unitNonUbb = removeOldSpOptions(filteredEffects.unitNonUbb, existingSpBuffs);
                }
                filteredEffects.unitNonUbb.push(spEffect);
              }
            } else if (spEffect.sp_type === 'add to ubb') {
              // only add burst enhancements if they are already included
              const existingBuff = filteredEffects.unitUbb.find(e => e['proc id'] === spEffect['proc id'] || e['unknown proc id'] === spEffect['unknown proc id']);
              if (existingBuff) {
                const existingSpBuffs = filteredEffects.unitUbb.filter(e => e['proc id'] === spEffect['proc id'] || e['unknown proc id'] === spEffect['unknown proc id'] && e.sp_type === spEffect.sp_type);
                if (existingSpBuffs) { // remove old one, as current one will replace it
                  filteredEffects.unitUbb = removeOldSpOptions(filteredEffects.unitUbb, existingSpBuffs);
                }
                filteredEffects.unitUbb.push(spEffect);
              }
            }
          });
          Object.values(entryEffects.spheres).forEach(sphere => {
            const buffs = extractBuffsFromEffects(sphere)
              .filter(triggeredEffect => triggeredEffect['target type'] === targetTypes.PARTY);
            if (buffs.length > 0) {
              filteredEffects.spheres = filteredEffects.spheres.concat(buffs);
            }
          });
          processExtraSkill(entryEffects.es);
        }
        // TODO: burst effects

        aggregatedEffects = Object.values(filteredEffects)
          .filter(v => v.length > 0)
          .reduce((acc, val) => acc.concat(val), [])
          .sort((a, b) => {
            return +getEffectId(a) - +getEffectId(b) ||
            (!a.sp_type && b.sp_type ? -1 : 1) // sp types should go after original values
          });
      } else if (target === targetTypes.SELF) {
        const filteredEffects = {
          unitEs: [],
          unitSp: [],
          elgif: [],
          spheres: [],
          unitNonUbb: [],
          unitUbb: [],
        };
        if (type === squadBuffTypes.PASSIVE) {
          // passive effects have no buffs; buffs are extracted for squadBuffTypes.BUFF
          filteredEffects.unitEs = entryEffects.unit.es.filter(e => e['passive target'] === targetTypes.SELF && extractBuffsFromTriggeredEffect(e).length === 0);
          filteredEffects.elgif = entryEffects.es.filter(e => e['passive target'] === targetTypes.SELF && extractBuffsFromTriggeredEffect(e).length === 0);
          Object.values(entryEffects.spheres).forEach(sphere => {
            const buffs = sphere.filter(e => extractBuffsFromTriggeredEffect(e).length === 0);
            if (buffs.length > 0) {
              filteredEffects.spheres = filteredEffects.spheres.concat(buffs);
            }
          });
          filteredEffects.unitSp = entryEffects.unit.sp
            .filter(e => extractBuffsFromTriggeredEffect(e).length === 0 && !e.sp_type.startsWith('add to'));
        } else if (type === squadBuffTypes.BUFF) {

        }
        // TODO: burst effects

        console.warn(filteredEffects);
        aggregatedEffects = Object.values(filteredEffects)
          .filter(v => v.length > 0)
          .reduce((acc, val) => acc.concat(val), [])
          .sort((a, b) => {
            return +getEffectId(a) - +getEffectId(b) ||
            (!a.sp_type && b.sp_type ? -1 : 1) // sp types should go after original values
          });
      } else if (target === targetTypes.ENEMY) {
        aggregatedEffects = burstTypes.reduce((acc, type) => {
          const allEffects = entryEffects.unit[type];
          const enemyEffects = allEffects.filter(e => e['target type'] === targetTypes.ENEMY);
          return acc.concat(enemyEffects);
        }, []);
      }

      return aggregatedEffects;
    },
    /* eslint-enable */
  },
  watch: {
    async squad (newSquad) {
      this.setDocumentTitle();
      await this.updatePageDbForSquad(newSquad);
      /* eslint-disable no-console */
      console.warn(newSquad.units.map(u => getEffectsFromSquadUnitEntry(u, this)));
      console.warn(newSquad.units.map(u => this.getEffectMappingForSquadUnitEntry(u, targetTypes.SELF, squadBuffTypes.PASSIVE)));
      /* eslint-enable no-console */
    },
    editMode (isEditMode) {
      if (isEditMode) {
        this.tempSquad = cloneSquad(this.squad);
      } else {
        this.tempSquad = {};
      }
    },
    async tempSquad (newSquad) {
      if (newSquad && Array.isArray(newSquad.units)) {
        await this.updatePageDbForSquad(newSquad);
      }
    },
  },
};
</script>

<style>

</style>
