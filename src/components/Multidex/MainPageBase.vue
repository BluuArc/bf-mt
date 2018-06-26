<template>
  <v-container grid-list-sm class="pb-5 multidex-page">
    <v-navigation-drawer
      persistent
      right
      :value="showFilterSheet && !isDataLoading && hasRequiredModules"
      enable-resize-watcher
      :clipped="$vuetify.breakpoint.lgAndUp"
      fixed
      app>
      <v-btn block @click="showFilterSheet = false">
        Close Sidebar
        <v-spacer/>
        <v-icon right>chevron_right</v-icon>
      </v-btn>
      <h3 class="headline pl-3 pt-3">Filters</h3>
      <v-card flat class="filter-area">
        <v-card-text>
          <v-container fluid class="pa-0">
            <v-expansion-panel>
              <v-expansion-panel-content v-if="filterTypes.includes('elements')">
                <div slot="header">
                  <h3 class="subheading">Element</h3>
                </div>
                <v-layout row wrap>
                  <v-flex xs12>
                    <v-btn outline class="mr-0" @click="filterOptions.elements = defaultFilters.elements.slice()">All</v-btn>
                    <v-btn outline class="ml-0" @click="filterOptions.elements = []">None</v-btn>
                    <v-layout row wrap>
                      <v-flex xs4 v-for="(element, i) in defaultFilters.elements" :key="i">
                        <v-checkbox :value="element" v-model="filterOptions.elements">
                          <div slot="label">
                            <element-icon :element="element" class="ml-2"/>
                          </div>
                        </v-checkbox>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
              <v-expansion-panel-content v-if="filterTypes.includes('rarity')">
                <div slot="header">
                  <h3 class="subheading">Rarity</h3>
                </div>
                <v-layout row wrap>
                  <v-flex xs12>
                    <v-btn outline class="mr-0" @click="filterOptions.rarity = defaultFilters.rarity.slice()">All</v-btn>
                    <v-btn outline class="ml-0" @click="filterOptions.rarity = []">None</v-btn>
                    <v-layout row wrap>
                      <v-flex xs4 v-for="(rarity, i) in defaultFilters.rarity" :key="i">
                        <v-checkbox :value="rarity" v-model="filterOptions.rarity">
                          <div slot="label">
                            <span v-if="rarity < 8">
                              <h3 class="subheading d-inline-block">{{ rarity }}</h3>
                              <img class="icon bf" src="@/assets/star_rare.png" height="18px" style="margin-top: -0.25rem;"/>
                            </span>
                            <img v-else class="icon bf" src="@/assets/phantom_icon.png" height="18px"/>
                          </div>
                        </v-checkbox>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
              <v-expansion-panel-content v-if="filterTypes.includes('kind')">
                <div slot="header">
                  <h3 class="subheading">Type</h3>
                </div>
                <v-layout row wrap>
                  <v-flex xs12>
                    <v-btn outline class="mr-0" @click="filterOptions.kind = defaultFilters.kind.slice()">All</v-btn>
                    <v-btn outline class="ml-0" @click="filterOptions.kind = []">None</v-btn>
                    <v-layout row wrap>
                      <v-flex xs6 v-for="(kind, i) in defaultFilters.kind" :key="i">
                        <v-checkbox :value="kind" v-model="filterOptions.kind">
                          <div slot="label">
                            <span style="text-transform: capitalize">{{ kind }}</span>
                          </div>
                        </v-checkbox>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
              <v-expansion-panel-content v-if="filterTypes.includes('gender')">
                <div slot="header">
                  <h3 class="subheading">Gender</h3>
                </div>
                <v-layout row wrap>
                  <v-flex xs12>
                    <v-btn outline class="mr-0" @click="filterOptions.gender = defaultFilters.gender.slice()">All</v-btn>
                    <v-btn outline class="ml-0" @click="filterOptions.gender = []">None</v-btn>
                    <v-layout row wrap>
                      <v-flex xs4 v-for="(gender, i) in defaultFilters.gender" :key="i">
                        <v-checkbox :value="gender" v-model="filterOptions.gender">
                          <div slot="label">
                            <v-icon :color="getGenderInfo(gender).color">fas {{ getGenderInfo(gender).icon }}</v-icon>
                          </div>
                        </v-checkbox>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
              <v-expansion-panel-content v-if="filterTypes.includes('itemTypes')">
                <div slot="header">
                  <h3 class="subheading">Item Type</h3>
                </div>
                <v-layout row wrap>
                  <v-flex xs12>
                    <v-btn outline dense class="mr-0" @click="filterOptions.itemTypes = defaultFilters.itemTypes.slice()">All</v-btn>
                    <v-btn outline dense class="ml-0" @click="filterOptions.itemTypes = []">None</v-btn>
                    <v-layout row wrap>
                      <v-flex xs6 v-for="(type, i) in defaultFilters.itemTypes" :key="i">
                        <v-checkbox :value="type" v-model="filterOptions.itemTypes">
                          <div slot="label">
                            <span style="text-transform: capitalize">{{ knownConstants.itemTypeMapping[type] }}</span>
                          </div>
                        </v-checkbox>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
              <v-expansion-panel-content v-if="filterTypes.includes('sphereTypes')">
                <div slot="header">
                  <h3 class="subheading">Sphere Type</h3>
                </div>
                <v-layout row wrap>
                  <v-flex xs12>
                    <br>
                    <v-btn outline class="mr-0" @click="filterOptions.sphereTypes = defaultFilters.sphereTypes.slice()">All</v-btn>
                    <v-btn outline class="ml-0" @click="filterOptions.sphereTypes = []">None</v-btn>
                    <v-layout row wrap>
                      <v-flex xs12 v-for="(type, i) in defaultFilters.sphereTypes" :key="i">
                        <v-checkbox :value="type" v-model="filterOptions.sphereTypes">
                          <div slot="label">
                            <sphere-type-icon :category="type" class="ml-0 mr-1"/>
                            <span style="text-transform: capitalize">{{ getSphereCategory(type) }}</span>
                          </div>
                        </v-checkbox>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
              <v-expansion-panel-content v-if="filterTypes.includes('land')">
                <div slot="header">
                  <h3 class="subheading">Lands</h3>
                </div>
                <v-layout row wrap>
                  <v-flex xs12>
                    <v-btn outline class="mr-0" @click="filterOptions.land = []">Reset</v-btn>
                    <v-layout row wrap>
                      <v-flex xs12>
                        <v-select
                          :items="moduleStateInfo.missions.possibleValues.land || []"
                          v-model="filterOptions.land"
                          label="Select Lands"
                          multiple
                          chips
                          autocomplete
                          hint="Empty selection is equivalent to showing all."
                          persistent-hint/>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
              <v-expansion-panel-content v-if="filterTypes.includes('area')">
                <div slot="header">
                  <h3 class="subheading">Areas</h3>
                </div>
                <v-layout row wrap>
                  <v-flex xs12>
                    <v-btn outline class="mr-0" @click="filterOptions.area = []">Reset</v-btn>
                    <v-layout row wrap>
                      <v-flex xs12>
                        <v-select
                          :items="moduleStateInfo.missions.possibleValues.area || []"
                          v-model="filterOptions.area"
                          label="Select Areas"
                          multiple
                          chips
                          autocomplete
                          hint="Empty selection is equivalent to showing all."
                          persistent-hint/>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
              <v-expansion-panel-content v-if="filterTypes.includes('dungeon')">
                <div slot="header">
                  <h3 class="subheading">Dungeons</h3>
                </div>
                <v-layout row wrap>
                  <v-flex xs12>
                    <v-btn outline class="mr-0" @click="filterOptions.dungeon = []">Reset</v-btn>
                    <v-layout row wrap>
                      <v-flex xs12>
                        <v-select
                          :items="moduleStateInfo.missions.possibleValues.dungeon || []"
                          v-model="filterOptions.dungeon"
                          label="Select Dungeons"
                          multiple
                          chips
                          autocomplete
                          hint="Empty selection is equivalent to showing all."
                          persistent-hint/>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
              <v-expansion-panel-content v-if="filterTypes.includes('craftables')">
                <div slot="header">
                  <h3 class="subheading">Craftables</h3>
                </div>
                <v-layout row wrap>
                  <v-flex xs12>
                    <v-layout row>
                      <v-radio-group v-model="filterOptions.craftables">
                        <v-radio
                          :value="knownConstants.craftableFilterOptions.all"
                          label="All"/>
                        <v-radio
                          :value="knownConstants.craftableFilterOptions.craftable"
                          label="Craftables Only"/>
                        <v-radio
                          :value="knownConstants.craftableFilterOptions.nonCraftable"
                          label="Non-Craftables Only"/>
                      </v-radio-group>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
              <v-expansion-panel-content v-if="filterTypes.includes('usage')">
                <div slot="header">
                  <h3 class="subheading">Usage</h3>
                </div>
                <v-layout row wrap>
                  <v-flex xs12>
                    <v-layout row>
                      <v-radio-group v-model="filterOptions.usage">
                        <v-radio
                          :value="knownConstants.usageFilterOptions.all"
                          label="All"/>
                        <v-radio
                          :value="knownConstants.usageFilterOptions.used"
                          label="Used in Other Items Only"/>
                        <v-radio
                          :value="knownConstants.usageFilterOptions.unused"
                          label="Not Used in Other Items"/>
                      </v-radio-group>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
              <v-expansion-panel-content v-if="filterTypes.includes('associatedUnits')">
                <div slot="header">
                  <h3 class="subheading">Associated Units</h3>
                </div>
                <v-layout row wrap>
                  <v-flex xs12>
                    <v-layout row>
                      <v-radio-group v-model="filterOptions.associatedUnits">
                        <v-radio
                          :value="knownConstants.associatedUnitOptions.all"
                          label="All"/>
                        <v-radio
                          :value="knownConstants.associatedUnitOptions.with"
                          label="With Associated Units"/>
                        <v-radio
                          :value="knownConstants.associatedUnitOptions.without"
                          label="Without Associated Units"/>
                      </v-radio-group>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
              <v-expansion-panel-content v-if="filterTypes.includes('associatedItems')">
                <div slot="header">
                  <h3 class="subheading">Associated Items</h3>
                </div>
                <v-layout row wrap>
                  <v-flex xs12>
                    <v-layout row>
                      <v-radio-group v-model="filterOptions.associatedItems">
                        <v-radio
                          :value="knownConstants.withWithoutTernaryOptions.all"
                          label="All"/>
                        <v-radio
                          :value="knownConstants.withWithoutTernaryOptions.with"
                          label="With Associated Items"/>
                        <v-radio
                          :value="knownConstants.withWithoutTernaryOptions.without"
                          label="Without Associated Items"/>
                      </v-radio-group>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
              <v-expansion-panel-content v-if="filterTypes.includes('gems')">
                <div slot="header">
                  <h3 class="subheading">Gems</h3>
                </div>
                <v-layout row wrap>
                  <v-flex xs12>
                    <v-layout row>
                      <v-radio-group v-model="filterOptions.gems">
                        <v-radio
                          :value="knownConstants.withWithoutTernaryOptions.all"
                          label="All"/>
                        <v-radio
                          :value="knownConstants.withWithoutTernaryOptions.with"
                          label="With Gems Only"/>
                        <v-radio
                          :value="knownConstants.withWithoutTernaryOptions.without"
                          label="Without Gems"/>
                      </v-radio-group>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
              <v-expansion-panel-content v-if="filterTypes.includes('continues')">
                <div slot="header">
                  <h3 class="subheading">Quest Continues</h3>
                </div>
                <v-layout row wrap>
                  <v-flex xs12>
                    <v-layout row>
                      <v-radio-group v-model="filterOptions.continues">
                        <v-radio
                          :value="knownConstants.withWithoutTernaryOptions.all"
                          label="All"/>
                        <v-radio
                          :value="knownConstants.withWithoutTernaryOptions.with"
                          label="Quest Continues Allowed"/>
                        <v-radio
                          :value="knownConstants.withWithoutTernaryOptions.without"
                          label="No Quest Continues"/>
                      </v-radio-group>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
              <v-expansion-panel-content v-if="filterTypes.includes('exclusives')">
                <div slot="header">
                  <h3 class="subheading">Server Exclusives</h3>
                </div>
                <v-layout row wrap>
                  <v-flex xs12>
                    <p class="mb-0" v-if="!hasOtherServers">Please download data from the <router-link to="/settings" style="color: inherit">Settings Page</router-link> for at least one other server to use this filter.</p>
                    <v-layout row>
                      <v-radio-group v-model="filterOptions.exclusives">
                        <v-radio
                          :value="knownConstants.exclusiveFilterOptions.all"
                          :disabled="!hasOtherServers"
                          label="All"/>
                        <v-radio
                          :value="knownConstants.exclusiveFilterOptions.exclusive"
                          :disabled="!hasOtherServers"
                          label="Exclusives Only"/>
                        <v-radio
                          :value="knownConstants.exclusiveFilterOptions.nonExclusive"
                          :disabled="!hasOtherServers"
                          label="Non-Exclusives Only"/>
                      </v-radio-group>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-container>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>
    <v-layout row v-if="isDataLoading || !finishedInit">
      <v-flex xs12 class="pt-5">
        <loading-component :loading-message="pageLoadingMessage"/>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-else>
      <template v-if="!!hasRequiredModules">
        <v-flex xs12>
          <v-card raised class="mr-3 ml-3">
            <v-card-text>
              <v-container fluid class="pa-0">
                <v-layout row>
                  <v-flex xs8>
                    <v-text-field v-model="filterOptions.name" label="Search"/>
                  </v-flex>
                  <v-flex xs4 class="center-align-parent text-xs-center">
                    <span class="center-align-container">
                      <span>Showing {{ allSortedEntries.length }}</span>
                      <span style="white-space: nowrap;">{{ mainModule.fullName }}</span>
                    </span>
                  </v-flex>
                </v-layout>
                <v-layout row>
                  <v-flex xs12 class="text-xs-left">
                    <span>Active Filters:</span>
                  </v-flex>
                </v-layout>
                <v-layout row>
                  <v-flex xs10 md11 class="vertical-align-parent">
                    <template v-if="!hasFilters">
                      <h3 class="subheading vertical-align-container">No filters applied.</h3>
                    </template>
                    <template v-else>
                      <v-chip small v-show="filterTypes.includes('elements') && filterOptions.elements.length < defaultFilters.elements.length" style="text-transform: capitalize">
                        <span v-if="filterOptions.elements.length === 0">
                          No Elements
                        </span>
                        <span v-else>
                          <element-icon v-for="element in filterOptions.elements" :element="element" :key="element" class="ml-1"/>
                          <span v-if="filterOptions.elements.length === 1">Only</span>
                        </span>
                      </v-chip>
                      <v-chip small v-show="filterTypes.includes('rarity') && filterOptions.rarity.length < defaultFilters.rarity.length" style="text-transform: capitalize">
                        <span v-if="filterOptions.rarity.length === 1">
                          <span v-if="filterOptions.rarity[0] < 8">
                            <b>{{ filterOptions.rarity[0] }}</b>
                            <img class="icon bf" src="@/assets/star_rare.png" height="18px" style="margin-top: -0.25rem;"/>
                          </span>
                          <img v-else class="icon bf" src="@/assets/phantom_icon.png" height="18px"/>
                          Only
                        </span>
                        <span v-else-if="filterOptions.rarity.length === 0">
                          No rarity
                        </span>
                        <span v-else>
                          {{ filterOptions.rarity.length }} Different Rarities
                        </span>
                      </v-chip>
                      <v-chip small v-show="filterTypes.includes('kind') && filterOptions.kind.length < defaultFilters.kind.length" style="text-transform: capitalize">
                        <span v-if="filterOptions.kind.length === 0">
                          No Types
                        </span>
                        <span v-else-if="filterOptions.kind.length === 1">
                          {{ filterOptions.kind[0] }} Only
                        </span>
                        <span v-else>
                          {{ filterOptions.kind.length }} Types
                        </span>
                      </v-chip>
                      <v-chip small v-show="filterTypes.includes('gender') && filterOptions.gender.length < defaultFilters.gender.length" style="text-transform: capitalize">
                        <span v-if="filterOptions.gender.length === 0">
                          No Genders
                        </span>
                        <span v-else>
                          <v-icon v-for="gender in filterOptions.gender" :key="gender" :color="getGenderInfo(gender).color">fas {{ getGenderInfo(gender).icon }}</v-icon>
                          <span v-if="filterOptions.gender.length === 1">Only</span>
                        </span>
                      </v-chip>
                      <v-chip small v-show="filterTypes.includes('itemTypes') && filterOptions.itemTypes.length < defaultFilters.itemTypes.length" style="text-transform: capitalize">
                        <span v-if="filterOptions.itemTypes.length === 0">
                          No Types
                        </span>
                        <span v-else-if="filterOptions.itemTypes.length === 1">
                          {{ filterOptions.itemTypes[0] }}s Only
                        </span>
                        <span v-else>
                          {{ filterOptions.itemTypes.length }} Item Types
                        </span>
                      </v-chip>
                      <v-chip small v-show="filterTypes.includes('sphereTypes') && filterOptions.sphereTypes.length < defaultFilters.sphereTypes.length" style="text-transform: capitalize">
                        <span v-if="filterOptions.sphereTypes.length === 0">
                          No Types
                        </span>
                        <span v-else-if="filterOptions.sphereTypes.length <= 5">
                          <sphere-type-icon v-for="sphereType in filterOptions.sphereTypes" :category="sphereType" :key="sphereType" class="ml-0 mr-1" style="margin-bottom: 2px"/>
                          <span v-if="filterOptions.sphereTypes.length === 1">
                            Only
                          </span>
                        </span>
                        <span v-else>
                          {{ filterOptions.sphereTypes.length }} Sphere Types
                        </span>
                      </v-chip>
                      <v-chip small v-show="filterTypes.includes('land') && filterOptions.land.length > 0" style="text-transform: capitalize">
                        <span v-if="filterOptions.land.length === 1">
                          Land: {{ filterOptions.land[0] }}
                        </span>
                        <span v-else>
                          {{ filterOptions.land.length }} Lands
                        </span>
                      </v-chip>
                      <v-chip small v-show="filterTypes.includes('area') && filterOptions.area.length > 0" style="text-transform: capitalize">
                        <span v-if="filterOptions.area.length === 1">
                          Area: {{ filterOptions.area[0] }}
                        </span>
                        <span v-else>
                          {{ filterOptions.area.length }} Areas
                        </span>
                      </v-chip>
                      <v-chip small v-show="filterTypes.includes('dungeon') && filterOptions.dungeon.length > 0" style="text-transform: capitalize">
                        <span v-if="filterOptions.dungeon.length === 1">
                          Dungeon: {{ filterOptions.dungeon[0] }}
                        </span>
                        <span v-else>
                          {{ filterOptions.dungeon.length }} Dungeons
                        </span>
                      </v-chip>
                      <v-chip small v-show="filterTypes.includes('land') && filterOptions.land.length > 0" style="text-transform: capitalize">
                        <span v-if="filterOptions.land.length === 1">
                          Land: {{ filterOptions.land[0] }}
                        </span>
                        <span v-else>
                          {{ filterOptions.land.length }} Lands
                        </span>
                      </v-chip>
                      <v-chip small v-show="filterTypes.includes('craftables') && filterOptions.craftables.length < defaultFilters.craftables.length" style="text-transform: capitalize">
                        {{ filterOptions.craftables[0] }}s Only
                      </v-chip>
                      <v-chip small v-show="filterTypes.includes('usage') && filterOptions.usage.length < defaultFilters.usage.length" style="text-transform: capitalize">
                        {{ filterOptions.usage[0] }} Items Only
                      </v-chip>
                      <v-chip small v-show="filterTypes.includes('associatedUnits') && filterOptions.associatedUnits.length < defaultFilters.associatedUnits.length" style="text-transform: capitalize">
                        {{ filterOptions.associatedUnits[0] }} Associated Units Only
                      </v-chip>
                      <v-chip small v-show="filterTypes.includes('associatedItems') && filterOptions.associatedItems.length < defaultFilters.associatedItems.length" style="text-transform: capitalize">
                        {{ filterOptions.associatedItems[0] }} Associated Items Only
                      </v-chip>
                      <v-chip small v-show="filterTypes.includes('gems') && filterOptions.gems.length < defaultFilters.gems.length" style="text-transform: capitalize">
                        {{ filterOptions.gems[0] }} Gems Only
                      </v-chip>
                      <v-chip small v-show="filterTypes.includes('continues') && filterOptions.continues.length < defaultFilters.continues.length" style="text-transform: capitalize">
                        {{ filterOptions.continues[0] }} Continues Only
                      </v-chip>
                      <v-chip small v-show="filterTypes.includes('exclusives') && filterOptions.exclusives.length < defaultFilters.exclusives.length" style="text-transform: capitalize">
                        {{ filterOptions.exclusives[0] }}s Only
                      </v-chip>
                    </template>
                  </v-flex>
                  <v-flex xs2 md1 class="text-xs-right">
                    <v-btn flat icon class="mr-0 pr-1" @click="showFilterSheet = !showFilterSheet">
                      <v-icon>filter_list</v-icon>
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-expansion-panel>
              <v-expansion-panel-content>
                <div slot="header">
                  <v-layout row wrap>
                    <span style="align-self: center">Sort</span>
                    <v-chip small>{{ sortOptions.type }}</v-chip>
                    <v-chip small>{{ sortOptions.isAscending ? 'Ascending' : 'Descending' }}</v-chip>
                  </v-layout>
                </div>
                <v-card>
                  <v-card-text>
                    <v-layout row wrap class="pl-3 pr-3">
                      <v-flex xs12 sm6 md12>
                        <h3 class="subheading">Sort Type</h3>
                        <v-radio-group v-model="sortOptions.type" :row="$vuetify.breakpoint.mdAndUp">
                          <v-radio
                            v-for="(type, i) in Object.keys(sortTypes).sort()"
                            :key="i"
                            :value="type"
                            :label="type"/>
                        </v-radio-group>
                      </v-flex>
                      <v-flex xs12 sm6 md12>
                        <h3 class="subheading">Sort Order</h3>
                        <v-radio-group v-model="sortOptions.isAscending" :row="$vuetify.breakpoint.mdAndUp">
                          <v-radio :value="true" label="Ascending"/>
                          <v-radio :value="false" label="Descending"/>
                        </v-radio-group>
                      </v-flex>
                    </v-layout>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-card>
        </v-flex>
        <v-flex xs6 class="pl-3">
          <v-btn v-show="hasFilters" flat @click="resetFilters" small class="pa-0">Reset Filters</v-btn>
        </v-flex>
        <v-flex xs6 class="text-xs-right mt-2 pr-3">
          <v-menu offset-y :close-on-content-click="false">
            <div slot="activator">
              <span>Page {{ pageIndex + 1 }} of {{ numPages }}</span>
              <v-icon>fas fa-caret-down</v-icon>
            </div>
            <v-card>
              <v-card-text>
                <v-container fluid class="pa-0">
                  <v-layout row>
                    <v-flex xs6 class="text-xs-center" style="margin: auto">
                      Entries Per Page:
                    </v-flex>
                    <v-flex xs6 class="text-xs-center">
                      <v-text-field v-model="amountPerPage" solo-inverted type="number" min="1"/>
                    </v-flex>
                  </v-layout>
                  <v-layout row>
                    <v-flex xs6 class="text-xs-center">
                      <v-btn block flat @click="pageIndex = 0">First Page</v-btn>
                    </v-flex>
                    <v-flex xs6 class="text-xs-center">
                      <v-btn block flat @click="pageIndex = numPages - 1">Last Page</v-btn>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
            </v-card>
          </v-menu>
          <v-btn
            fixed fab bottom left
            :disabled="pageIndex <= 0"
            :small="$vuetify.breakpoint.smAndDown"
            style="z-index: 6;"
            color="primary" @click="decrementPage">
            <span v-show="pageIndex >= 1">
              {{ pageIndex }}
            </span>
          </v-btn>
          <v-btn
            fixed fab bottom right
            :disabled="pageIndex >= (numPages - 1)"
            :small="$vuetify.breakpoint.smAndDown"
            color="primary" @click="incrementPage">
            <span v-show="pageIndex + 1 < numPages">
              {{ pageIndex + 2 }}
            </span>
          </v-btn>
        </v-flex>
        <v-flex xs12 class="text-xs-center pt-5" v-if="loadingFilters">
          <v-progress-circular indeterminate/>
          <h4 class="subheading">Searching for entries with specified filters.</h4>
        </v-flex>
      </template>
      <v-flex xs12 v-if="!loadingFilters">
        <result-viewer
          class="grid-list-lg"
          :max-results="moduleStateInfo[mainModule.name].numEntries[activeServer]"
          :num-results="allSortedEntries.length"
          :required-modules="requiredModules"
          :server-type="activeServer">
          <slot name="results-area" :results="entriesToShow">
            Put your result code here.
            <v-layout row wrap>
              <v-flex
                v-for="key in entriesToShow"
                :key="key"
                xs12 sm6 md4>
                <v-card :to="getMultidexPathTo(key, activeServer)" v-if="pageDb.hasOwnProperty(key)">
                  <v-card-text>
                    {{ pageDb[key].name || pageDb[key].description || key }}
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
          </slot>
        </result-viewer>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-dialog v-model="showDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card>
          <v-toolbar fixed>
            <v-btn icon :to="dialogCloseLink || $route.path">
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>
              <slot name="dialog-toolbar-title">
                <span style="margin-top: auto; margin-bottom: auto;" class="pl-2">
                  <span v-if="pageDb[viewId]">
                    {{ pageDb[viewId].name }}
                  </span>
                  <span v-else-if="viewId">
                    (ID: {{ viewId }})
                  </span>
                </span>
              </slot>
            </v-toolbar-title>
          </v-toolbar>
          <template v-if="viewId">
            <v-card-text v-if="!pageDb[viewId]" class="pl-0 pr-0 pt-5">
              <v-card flat>
                <v-card-text>
                  <v-container>
                    <v-layout row wrap>
                      <v-flex xs12 class="text-xs-center">
                        <h3 class="subheading">
                          Entry with ID {{ viewId }} not found in current server ({{ activeServer.toUpperCase() }}). Would you like to try using a different server?
                        </h3>
                      </v-flex>
                    </v-layout>
                    <v-layout row wrap class="pt-2">
                      <v-flex
                        v-for="(server, i) in knownConstants.servers"
                        :key="i"
                        xs12 sm4
                        class="text-xs-center">
                        <v-btn
                          large
                          :block="$vuetify.breakpoint.xsOnly"
                          :disabled="server === activeServer"
                          v-text="server"
                          :to="getMultidexPathTo(viewId, server)"/>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card-text>
              </v-card>
            </v-card-text>
            <v-card-text v-else class="pl-0 pr-0 pt-5">
              <slot name="dialog-content">
                <v-card flat>
                  <v-card-text>
                    <p>Put your dialog content here.</p>

                    {{ pageDb[viewId] }}
                  </v-card-text>
                </v-card>
              </slot>
            </v-card-text>
          </template>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>

<script>
import { moduleInfo } from '@/store';
import { knownConstants } from '@/store/modules/db.common';
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex';
import debounce from 'lodash/debounce';
import ResultViewer from '@/components/Multidex/ResultViewer';
import LoadingComponent from '@/components/Multidex/LoadingComponent';
import ElementIcon from '@/components/Multidex/Units/ElementIcon';
import SphereTypeIcon from '@/components/Multidex/Items/SphereTypeIcon';

const multidexModules = moduleInfo.filter(m => m.type === 'multidex');
const arrayBasedFilters = [
  'elements',
  'rarity',
  'gender',
  'kind',
  'sphereTypes',
  'itemTypes',
  'associatedUnits',
  'associatedItems',
  'craftables',
  'usage',
  'gems',
  'continues',
  'exclusives',
  'land',
  'area',
  'dungeon',
];
export default {
  props: {
    requiredModules: {
      type: Array,
      default: () => [],
    },
    defaultAmountPerPage: {
      type: Number,
      default: 27,
    },
    viewId: {
      type: String,
      default: '',
    },
    routeKey: {
      type: String,
      default: 'multidex-default',
    },
    pageDb: {
      type: Object,
      default: () => {},
    },
    minRarity: {
      type: Number,
      default: 0,
    },
    maxRarity: {
      type: Number,
      default: 8,
    },
    sortTypes: {
      type: Object,
      default: () => {
        return {
          'Data ID': (idA, idB, isAscending) => {
            const result = (+idA - +idB);
            return isAscending ? result : -result;
          },
        };
      },
    },
    filterTypes: {
      type: Array,
      default: () => arrayBasedFilters.slice(),
    },
    dialogCloseLink: {
      type: String,
      default: '',
    },
    inputServer: {
      type: String,
      default: '',
    },
    getMultidexPathTo: {
      type: Function,
      required: true,
    },
  },
  components: {
    'result-viewer': ResultViewer,
    'loading-component': LoadingComponent,
    'element-icon': ElementIcon,
    'sphere-type-icon': SphereTypeIcon,
  },
  computed: {
    ...mapState('settings', ['activeServer']),
    ...mapState(['inInitState', 'sortAndFilterSettings']),
    ...mapGetters('items', ['getSphereCategory']),
    ...mapState('missions', ['possibleValues']),
    ...(() => {
      // get state for each module
      let result = {};
      multidexModules.map(m => m.name).forEach(m => {
        const stateMapping = {};
        stateMapping[`${m}IsLoading`] = 'isLoading';
        stateMapping[`${m}LoadingMessage`] = 'loadingMessage';
        stateMapping[`${m}NumEntries`] = 'numEntries';

        const getterMapping = {};
        getterMapping[`${m}GetMultidexPathTo`] = 'getMultidexPathTo';

        result = {
          ...result,
          ...mapState(m, stateMapping),
          ...mapGetters(m, getterMapping),
        };
      });
      return result;
    })(),
    knownConstants: () => knownConstants,
    pageModules () {
      return multidexModules.filter(m => this.requiredModules.includes(m.name));
    },
    mainModule () {
      if (!this.pageModules.length === 0) {
        console.warn('No page modules specified. Defaulting to module at first index.', multidexModules[0]);
      }
      return this.pageModules.filter(m => m.name === this.requiredModules[0])[0] || multidexModules[0];
    },
    hasOtherServers () {
      const numEntriesStatsForCurrentModule = this.moduleStateInfo[this.mainModule.name].numEntries;
      return Object.keys(numEntriesStatsForCurrentModule).filter(s => s !== this.activeServer)
        .map(s => numEntriesStatsForCurrentModule[s]).reduce((acc, val) => acc + val, 0) > 0;
    },
    moduleStateInfo () {
      const result = {};
      this.pageModules.map(m => m.name)
        .forEach(m => {
          result[m] = {
            isLoading: this[`${m}IsLoading`],
            loadingMessage: this[`${m}LoadingMessage`],
            numEntries: this[`${m}NumEntries`],
            getMultidexPathTo: this[`${m}GetMultidexPathTo`],
            possibleValues: (m === 'missions') ? this.possibleValues : {},
          };
        });
      return result;
    },
    isDataLoading () {
      return this.inInitState || (Object.values(this.moduleStateInfo).map(s => s.isLoading).reduce((acc, val) => acc || val, false));
    },
    pageLoadingMessage () {
      return this.pageModules
        .filter(m => this.moduleStateInfo[m.name].loadingMessage)
        .map(m => `[${m.fullName}] ${this.moduleStateInfo[m.name].loadingMessage}`)
        .reduce((acc, val) => acc || val, '');
    },
    totalEntries () {
      return this.pageModules
        .map(m => this.moduleStateInfo[m.name].numEntries[this.activeServer])
        .reduce((acc, val) => acc + val, 0);
    },
    hasRequiredModules () {
      return this.pageModules
        .map(m => {
          const numEntries = this.moduleStateInfo[m.name].numEntries[this.activeServer];
          return numEntries === 0;
        }).filter(hasNoEntries => !!hasNoEntries).length === 0;
    },
    allSortedEntries () {
      if (this.isDataLoading || this.loadingFilters) {
        return [];
      }
      try {
        const result = this.filteredKeys.slice().sort((a, b) => this.sortTypes[this.sortOptions.type](a, b, this.sortOptions.isAscending));
        return result;
      } catch (err) {
        console.error('error sorting', err);
        return this.filteredKeys;
      }
    },
    numPages () {
      return Math.ceil(this.allSortedEntries.length / this.amountPerPage);
    },
    entriesToShow () {
      const startIndex = this.pageIndex * this.amountPerPage;
      return this.allSortedEntries.slice(startIndex, startIndex + this.amountPerPage);
    },
    defaultFilters () {
      return {
        elements: knownConstants.elements.slice(),
        rarity: Object.keys(new Array(this.maxRarity - this.minRarity + 1).fill(0)).map(i => +i + this.minRarity),
        gender: knownConstants.gender.slice(),
        kind: knownConstants.unitKind.slice(),
        sphereTypes: Object.keys(new Array(15).fill(0)).map(i => +i),
        itemTypes: knownConstants.itemTypes.slice(),
        associatedUnits: knownConstants.associatedUnitOptions.all,
        associatedItems: knownConstants.withWithoutTernaryOptions.all,
        gems: knownConstants.withWithoutTernaryOptions.all,
        continues: knownConstants.withWithoutTernaryOptions.all,
        craftables: knownConstants.craftableFilterOptions.all,
        usage: knownConstants.usageFilterOptions.all,
        exclusives: knownConstants.exclusiveFilterOptions.all,
        land: [],
        area: [],
        dungeon: [],
      };
    },
    hasFilters () {
      return !!this.filterOptions.name ||
        Object.keys(this.defaultFilters)
        .map(key => this.filterOptions[key].length !== this.defaultFilters[key].length)
        .reduce((acc, val) => acc || val, false);
    },
  },
  data () {
    const filterOptions = {};
    arrayBasedFilters.forEach(filterType => {
      filterOptions[filterType] = [];
    });
    return {
      pageIndex: 0,
      amountPerPage: 27,
      showDialog: false,
      filteredKeys: [],
      loadingFilters: false,
      finishedInit: false,
      showFilterSheet: false,
      sortOptions: {
        type: 'ID',
        isAscending: true,
      },
      filterOptions: {
        ...filterOptions,
        name: '',
      },
    };
  },
  watch: {
    totalEntries () {
      this.pageIndex = 0;
      this.applyFilters();
    },
    amountPerPage (newValue) {
      this.pageIndex = 0;
      const value = !isNaN(newValue) ? +newValue : 1;
      if (value < 1) {
        this.amountPerPage = 1;
      } else if (value > this.allSortedEntries.length) {
        this.amountPerPage = this.allSortedEntries.length;
      } else {
        this.amountPerPage = value;
      }
    },
    pageIndex () {
      window.scrollTo(0, 0);
      this.delayedPageIndexChecker();
    },
    isDataLoading (newValue) {
      this.setShowDialog();

      if (!newValue) {
        this.initDb();
        this.applyFilters();
      }
    },
    viewId (newValue) {
      this.setShowDialog();
      const entry = this.pageDb.hasOwnProperty(newValue) ? this.pageDb[newValue] : {};
      document.title = `BF-MT - ${this.mainModule.fullName} - ${entry.name || newValue}`;
    },
    async inputServer (newValue) {
      this.setServerBasedOnInputServer();
    },
    activeServer () {
      this.setShowDialog();
    },
    moduleStateInfo: {
      deep: true,
      handler () {
        this.setShowDialog();
      },
    },
    filterOptions: {
      deep: true,
      handler () {
        this.pageIndex = 0;
        this.applyFilters();
      },
    },
    sortOptions: {
      deep: true,
      handler () {
        this.pageIndex = 0;
        if (this.sortTypes[this.sortOptions.type]) {
          this.storeSortAndFilterSettings();
        } else {
          const defaultType = Object.keys(this.sortTypes)[0];
          if (this.finishedInit) {
            console.warn('unknown sort type', this.sortOptions.type, 'defaulting to', defaultType);
          }
          this.sortOptions.type = defaultType;
        }
      },
    },
    showDialog (newValue) {
      this.setHtmlOverflow(newValue);
    },
    finishedInit () {
      this.setShowDialog();
    },
    hasRequiredModules (newValue) {
      if (newValue && this.finishedInit) {
        this.finishedInit = false;
        this.initDb();
      }
    },
  },
  created () {
    if (!this.isDataLoading) {
      this.initDb();
    }
  },
  beforeMount () {
    if (this.defaultAmountPerPage !== this.amountPerPage) {
      this.amountPerPage = this.defaultAmountPerPage;
    }
  },
  mounted () {
    if (!this.isDataLoading && !this.finishedInit) {
      this.initDb();
    }

    this.resetFilters();
    if (this.sortAndFilterSettings[this.routeKey]) {
      this.restoreSortAndFilterSettings();
    } else {
      this.sortOptions.type = Object.keys(this.sortTypes)[0];
    }
    this.setShowDialog();
  },
  methods: {
    ...mapMutations(['setHtmlOverflow', 'setSortAndFilterSettings']),
    ...mapActions(['setActiveServer']),
    ...(() => {
      // get actions for each module
      let result = {};
      multidexModules.map(m => m.name).forEach(m => {
        const actionMapping = {};
        actionMapping[`${m}DbSync`] = 'ensurePageDbSyncWithServer';
        actionMapping[`${m}GetFilteredKeys`] = 'getFilteredKeys';
        result = {
          ...result,
          ...mapActions(m, actionMapping),
        };
      });
      return result;
    })(),
    async setServerBasedOnInputServer () {
      if (!this.inputServer) {
        return;
      }

      if (!knownConstants.servers.includes(this.inputServer)) {
        console.error('Unknown server', this.inputServer, 'Auto rerouting to last known valid server', this.activeServer);
        this.$router.push(this.getMultidexPathTo(this.viewId, this.activeServer));
      } else if (this.inputServer !== this.activeServer) {
        this.finishedInit = false;
        try {
          await this.setActiveServer(this.inputServer);
        } catch (err) {
          console.error(err);
        }
      }
    },
    setShowDialog () {
      this.showDialog = !this.isDataLoading && !!this.viewId && this.finishedInit && this.hasRequiredModules;
    },
    initDb: debounce(async function () {
      await this.setServerBasedOnInputServer();

      for (const m of this.pageModules.map(m => m.name)) {
        await this[`${m}DbSync`]();
      }
      this.finishedInit = true;
    }, 50),
    applyFilters () {
      this.filteredKeys = [];
      this.applyFiltersHelper();
    },
    applyFiltersHelper: debounce(async function () {
      const currentDbIsEmpty = this.moduleStateInfo[this.mainModule.name].numEntries[this.activeServer] === 0;
      if (currentDbIsEmpty) {
        console.debug('current db is empty');
        this.filteredKeys = [];
        return;
      }

      this.loadingFilters = true;
      this.filteredKeys = await this[`${this.mainModule.name}GetFilteredKeys`](this.filterOptions);
      delete this.filterOptions.forceUpdate;
      this.storeSortAndFilterSettings();
      this.loadingFilters = false;
    }, 250),
    storeSortAndFilterSettings () {
      const filterCopy = {};
      const { forceUpdate, ...filters } = this.filterOptions;
      Object.keys(filters)
        .forEach(key => {
          filterCopy[key] = this.filterOptions[key].slice();
        });

      const { ...sortCopy } = this.sortOptions;
      this.setSortAndFilterSettings({ key: this.routeKey, filter: filterCopy, sort: sortCopy });
    },
    restoreSortAndFilterSettings () {
      if (!this.sortAndFilterSettings[this.routeKey]) {
        return;
      }

      try {
        const { filter, sort } = this.sortAndFilterSettings[this.routeKey];
        Object.keys(filter).forEach(key => {
          this.filterOptions[key] = filter[key].slice();
        });

        const ternaryHandler = (ternaryFilterKey, constants = { all: [] }, trueValKey, falseValKey) => {
          if (this.filterOptions[ternaryFilterKey].length === 2) {
            this.filterOptions[ternaryFilterKey] = constants.all;
          } else {
            const elem = this.filterOptions[ternaryFilterKey][0];
            this.filterOptions[ternaryFilterKey] = constants[(elem === constants[trueValKey][0]) ? trueValKey : falseValKey];
          }
        };

        const ternaries = [
          ['exclusives', knownConstants.exclusiveFilterOptions, 'exclusive', 'nonExclusive'],
          ['associatedUnits', knownConstants.associatedUnitOptions, 'with', 'without'],
          ['associatedItems', knownConstants.withWithoutTernaryOptions, 'with', 'without'],
          ['gems', knownConstants.withWithoutTernaryOptions, 'with', 'without'],
          ['continues', knownConstants.withWithoutTernaryOptions, 'with', 'without'],
          ['craftables', knownConstants.craftableFilterOptions, 'craftable', 'nonCraftable'],
          ['usage', knownConstants.usageFilterOptions, 'used', 'unused'],
        ];

        ternaries.forEach((args) => {
          ternaryHandler(...args);
        });

        this.filterOptions.forceUpdate = true;

        ({ type: this.sortOptions.type, isAscending: this.sortOptions.isAscending } = sort);
      } catch (err) {
        console.error(err);
        this.resetFilters();
      } finally {
        this.applyFilters();
      }
    },
    resetFilters () {
      Object.keys(this.defaultFilters).forEach(key => {
        this.filterOptions[key] = this.defaultFilters[key].slice();
      });
      this.filterOptions.exclusives = this.defaultFilters.exclusives;
      this.filterOptions.associatedUnits = this.defaultFilters.associatedUnits;
      this.filterOptions.associatedItems = this.defaultFilters.associatedItems;
      this.filterOptions.gems = this.defaultFilters.gems;
      this.filterOptions.continues = this.defaultFilters.continues;
      this.filterOptions.craftables = this.defaultFilters.craftables;
      this.filterOptions.usage = this.defaultFilters.usage;
      this.filterOptions.name = '';
    },
    decrementPage () {
      if (this.pageIndex <= 0) {
        this.pageIndex = 0;
      } else {
        this.pageIndex -= 1;
      }
    },
    incrementPage () {
      if (this.pageIndex >= (this.numPages - 1)) {
        this.pageIndex = this.numPages;
      } else {
        this.pageIndex += 1;
      }
    },
    delayedPageIndexChecker: debounce(function () {
      // case for when the user clicks faster than the page can check
      if (this.pageIndex <= 0) {
        this.pageIndex = 0;
      } else if (this.pageIndex >= (this.numPages - 1)) {
        this.pageIndex = this.numPages - 1;
      }
    }, 50),
    getGenderInfo (gender) {
      const icons = {
        male: 'fa-mars',
        female: 'fa-venus',
        other: 'fa-genderless',
      };
      const colors = {
        male: 'light-blue',
        female: 'pink lighten-1',
        other: 'grey',
      };
      return {
        icon: icons[gender],
        color: colors[gender],
      };
    },
  },
};
</script>

<style>
.multidex-page .filter-area .expansion-panel__header {
  padding-left: 0;
  padding-right: 0;
}
</style>
