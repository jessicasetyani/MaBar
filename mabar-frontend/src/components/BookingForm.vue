<template>
  <form @submit.prevent="handleSubmit" class="space-y-8" novalidate>
    <!-- Enhanced 24-Hour Booking Time Selection -->
    <div v-if="!isEditMode && selectedSlots.length === 0" class="mb-8">
      <div
        class="bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 rounded-xl p-5 border-2 border-yellow-200 shadow-sm"
      >
        <div class="flex items-start space-x-3 mb-4">
          <div
            class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center shadow-sm"
          >
            <svg
              class="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div class="flex-1">
            <h4 class="text-base font-bold text-slate-800 mb-1">
              Flexible Duration Court Booking
            </h4>
            <p class="text-sm text-slate-600 leading-relaxed">
              Reserve the court for your desired duration (1-24 hours). Perfect
              for training sessions, matches, tournaments, or special events.
            </p>
          </div>
        </div>

        <!-- Material Design 3 Time & Duration Fields with Proper Spacing -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <!-- Start Time Field - Material Design 3 Filled Text Field -->
          <div class="md-text-field-container">
            <div
              class="md-text-field-filled md-text-field-clickable"
              @click="focusStartTimeInput"
            >
              <div class="md-text-field-leading-icon">
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <label
                class="md-text-field-label md-text-field-label-with-icon"
                for="start-time-input"
              >
                Start time
              </label>
              <input
                ref="startTimeInput"
                id="start-time-input"
                v-model="formData.startTime"
                type="datetime-local"
                step="900"
                data-format="24"
                data-time-format="24"
                lang="en-GB"
                class="md-text-field-input md-text-field-input-with-icon"
                required
                @input="handleDateTimeChange('start-time-input')"
                @change="handleDateTimeChange('start-time-input')"
                @focus="onStartTimeFocus"
                @blur="onStartTimeBlur"
                :min="getMinDateTime()"
              />
              <div class="md-text-field-active-indicator"></div>
            </div>
            <div class="md-text-field-supporting-text">
              Select your preferred booking start time
            </div>
          </div>

          <!-- End Time Field - Material Design 3 Filled Text Field -->
          <div class="md-text-field-container">
            <div
              class="md-text-field-filled md-text-field-clickable"
              @click="focusEndTimeInput"
            >
              <div class="md-text-field-leading-icon">
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a8.996 8.996 0 008.354-5.646z"
                  />
                </svg>
              </div>
              <label
                class="md-text-field-label md-text-field-label-with-icon"
                for="end-time-input"
              >
                End time
              </label>
              <input
                ref="endTimeInput"
                id="end-time-input"
                v-model="formData.endTime"
                type="datetime-local"
                step="900"
                data-format="24"
                data-time-format="24"
                lang="en-GB"
                class="md-text-field-input md-text-field-input-with-icon"
                required
                @change="handleDateTimeChange('end-time-input')"
                @focus="onEndTimeFocus"
                @blur="onEndTimeBlur"
                :min="getMinEndDateTime()"
              />
              <div class="md-text-field-active-indicator"></div>
            </div>
            <div class="md-text-field-supporting-text">
              Select when your booking ends
            </div>
            <div v-if="timeRangeError" class="text-sm text-red-600 mt-1">
              {{ timeRangeError }}
            </div>
          </div>
        </div>

        <!-- Material Design 3 Booking Summary Card -->
        <div v-if="formData.startTime && formData.endTime" class="mt-8 mb-8">
          <div
            class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-sm"
          >
            <div class="p-8">
              <!-- Header Section -->
              <div class="flex items-center mb-8">
                <div
                  class="w-14 h-14 rounded-full bg-yellow-200 flex items-center justify-center mr-5"
                >
                  <svg
                    class="w-7 h-7 text-yellow-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="text-2xl font-bold text-slate-800 mb-2">
                    Booking Summary
                  </h3>
                  <p class="text-slate-600">
                    Review your booking details before confirming
                  </p>
                </div>
              </div>

              <!-- Summary Content Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Duration Card -->
                <div class="bg-white rounded-xl p-6 shadow-sm">
                  <div class="flex items-center mb-4">
                    <div
                      class="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center mr-4"
                    >
                      <svg
                        class="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span
                      class="text-sm font-semibold text-slate-600 uppercase tracking-wide"
                      >Duration</span
                    >
                  </div>
                  <div class="text-xl font-bold text-slate-800">
                    {{ calculateDuration() }}
                  </div>
                </div>

                <!-- Start Time Card -->
                <div class="bg-white rounded-xl p-6 shadow-sm">
                  <div class="flex items-center mb-4">
                    <div
                      class="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center mr-4"
                    >
                      <svg
                        class="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                        />
                      </svg>
                    </div>
                    <span
                      class="text-sm font-semibold text-slate-600 uppercase tracking-wide"
                      >Start Time</span
                    >
                  </div>
                  <div class="text-xl font-bold text-slate-800">
                    {{ formatStartTime() }}
                  </div>
                </div>

                <!-- End Time Card -->
                <div
                  class="bg-white rounded-xl p-6 shadow-sm sm:col-span-2 lg:col-span-1"
                >
                  <div class="flex items-center mb-4">
                    <div
                      class="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center mr-4"
                    >
                      <svg
                        class="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a8.996 8.996 0 008.354-5.646z"
                        />
                      </svg>
                    </div>
                    <span
                      class="text-sm font-semibold text-slate-600 uppercase tracking-wide"
                      >End Time</span
                    >
                  </div>
                  <div class="text-xl font-bold text-slate-800">
                    {{ formatEndTime() }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Selected Slots Display -->
    <div
      v-else-if="selectedSlots.length > 0"
      class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200"
    >
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center space-x-2">
          <div
            class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
          >
            <span class="text-blue-600 text-sm font-bold">{{
              selectedSlots.length
            }}</span>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-blue-800">
              Selected Time Slots
            </h4>
            <p class="text-xs text-blue-600">{{ getSlotsSummary() }}</p>
          </div>
        </div>
        <div class="flex space-x-2">
          <button
            v-if="selectedSlots.length > 1"
            type="button"
            @click="toggleBatchMode"
            :class="[
              'px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200',
              batchMode
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-blue-700 hover:bg-blue-100 border border-blue-200',
            ]"
          >
            <span class="flex items-center space-x-1">
              <svg
                class="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="
                    batchMode
                      ? 'M9 12l2 2 4-4'
                      : 'M4 6h16M4 10h16M4 14h16M4 18h16'
                  "
                />
              </svg>
              <span>{{ batchMode ? 'Batch Mode' : 'Individual' }}</span>
            </span>
          </button>
        </div>
      </div>

      <!-- Slots Grid -->
      <div class="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
        <div
          v-for="(slot, index) in selectedSlots"
          :key="slot.id"
          class="flex justify-between items-center text-sm bg-white rounded-lg p-3 border border-blue-100 hover:border-blue-200 transition-colors"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600"
            >
              {{ index + 1 }}
            </div>
            <div>
              <div class="font-medium text-slate-800">
                {{ formatDateTime(slot.startTime) }} -
                {{ formatDateTime(slot.endTime) }}
              </div>
              <div class="text-xs text-slate-500">
                Duration: {{ getDuration(slot.startTime, slot.endTime) }}
              </div>
            </div>
          </div>
          <button
            type="button"
            @click="removeSlot(index)"
            class="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-md transition-colors"
            title="Remove slot"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Batch Mode Info -->
      <div
        v-if="batchMode && selectedSlots.length > 1"
        class="mt-4 pt-3 border-t border-blue-200"
      >
        <div class="flex items-center space-x-2 text-xs text-blue-700">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span
            >Batch mode: All {{ selectedSlots.length }} slots will use identical
            booking details</span
          >
        </div>
      </div>
    </div>

    <!-- Court Selection - Material Design 3 -->
    <div class="md-text-field-container">
      <div class="md-text-field-filled">
        <div class="md-text-field-leading-icon">
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <label
          class="md-text-field-label md-text-field-label-with-icon"
          for="court-select"
        >
          Paddle Field
        </label>
        <select
          id="court-select"
          v-model="formData.court"
          @focus="onCourtFocus"
          @blur="onCourtBlur"
          class="md-text-field-input md-select-input md-text-field-input-with-icon"
          required
        >
          <option value="">Select a court</option>
          <option v-for="field in paddleFields" :key="field" :value="field">
            {{ field }}
          </option>
        </select>
        <div class="md-text-field-active-indicator"></div>
        <svg
          class="md-select-dropdown-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      <div class="md-text-field-supporting-text">
        Choose the paddle court for your booking
      </div>
    </div>

    <!-- Booking Details -->
    <div class="space-y-10">
      <!-- Title - Material Design 3 -->
      <div class="md-text-field-container">
        <div class="md-text-field-filled">
          <div class="md-text-field-leading-icon">
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <label
            class="md-text-field-label md-text-field-label-with-icon"
            for="title-input"
          >
            Booking Title
          </label>
          <input
            id="title-input"
            v-model="formData.title"
            type="text"
            placeholder="e.g., John vs Mike - Training Session"
            class="md-text-field-input md-text-field-input-with-icon"
            required
            @focus="onTitleFocus"
            @blur="onTitleBlur"
          />
        </div>
        <div class="md-text-field-supporting-text">
          Enter a descriptive title for this booking
        </div>
      </div>

      <!-- Players with Individual Phones (minimum 1, maximum 4) -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <div>
            <h4 class="text-lg font-semibold text-slate-800 mb-1">
              Players with Phone Numbers
            </h4>
            <p class="text-sm text-slate-600">
              Add up to 4 players (minimum 1 required)
              <span
                class="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium"
              >
                {{
                  Math.max(
                    1,
                    formData.players.filter((p) => p && typeof p === 'string' && p.trim()).length
                  )
                }}/4 players
              </span>
            </p>
          </div>
        </div>

        <div class="space-y-6">
          <div
            v-for="(player, index) in formData.players"
            :key="index"
            class="player-row flex items-start gap-4"
          >
            <!-- Player Input Fields -->
            <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <!-- Player Name - Material Design 3 -->
              <div class="md-text-field-container">
                <div class="md-text-field-filled">
                  <div class="md-text-field-leading-icon">
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <label
                    class="md-text-field-label md-text-field-label-with-icon"
                    :for="`player-name-${index}`"
                  >
                    {{
                      index === 0
                        ? 'Main Player Name'
                        : `Player ${index + 1} Name`
                    }}
                  </label>
                  <input
                    :id="`player-name-${index}`"
                    v-model="formData.players[index]"
                    type="text"
                    :placeholder="
                      index === 0
                        ? 'Enter main player name'
                        : `Enter player ${index + 1} name`
                    "
                    :required="index === 0"
                    :class="[
                      'md-text-field-input md-text-field-input-with-icon',
                      getPlayerValidationClass(player, index).includes(
                        'border-red'
                      )
                        ? 'md-text-field-error'
                        : '',
                    ]"
                    @blur="validatePlayerName(index)"
                    @focus="onPlayerNameFocus"
                  />
                  <div class="md-text-field-active-indicator"></div>
                </div>
                <div class="md-text-field-supporting-text">
                  {{
                    index === 0
                      ? "Required - Enter the main player's full name"
                      : `Optional - Enter player ${index + 1}\'s full name`
                  }}
                </div>
                <div
                  v-if="index === 0 && playerValidationError"
                  class="text-sm text-red-600 mt-1 flex items-center"
                >
                  <svg
                    class="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {{ playerValidationError }}
                </div>
              </div>

              <!-- Player Phone - Material Design 3 -->
              <div class="md-text-field-container">
                <div class="md-text-field-filled">
                  <div class="md-text-field-leading-icon">
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <label
                    class="md-text-field-label md-text-field-label-with-icon"
                    :for="`player-phone-${index}`"
                  >
                    {{
                      index === 0
                        ? 'Main Player Phone'
                        : `Player ${index + 1} Phone`
                    }}
                  </label>
                  <input
                    :id="`player-phone-${index}`"
                    v-model="formData.playerPhones[index]"
                    type="tel"
                    :placeholder="
                      index === 0
                        ? '+62 812-3456-7890'
                        : `Player ${index + 1} phone number`
                    "
                    :required="
                      index === 0 ||
                      !!(
                        formData.players[index] &&
                        typeof formData.players[index] === 'string' &&
                        formData.players[index].trim()
                      )
                    "
                    class="md-text-field-input md-text-field-input-with-icon"
                    @input="onPlayerPhoneInput"
                    @focus="onPlayerPhoneFocus"
                    @blur="onPlayerPhoneBlur"
                    pattern="[0-9+\-\s]*"
                  />
                  <div class="md-text-field-active-indicator"></div>
                </div>
                <div class="md-text-field-supporting-text">
                  {{
                    index === 0
                      ? 'Required - Indonesian phone number (e.g., +62812345678 or 08123456789)'
                      : `Optional - Phone number for player ${index + 1}`
                  }}
                </div>
              </div>
            </div>

            <!-- Remove Player Button -->
            <div class="flex-shrink-0 mt-4">
              <button
                v-if="formData.players.length > 1 && index > 0"
                type="button"
                @click="removePlayer(index)"
                class="player-remove-button w-10 h-10 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 border border-red-200 hover:border-red-300"
                title="Remove player"
                :aria-label="`Remove player ${index + 1}`"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Add Player Button -->
        <div class="mt-6 pt-4 border-t border-slate-200">
          <button
            v-if="formData.players.length < 4"
            type="button"
            @click="addPlayer"
            class="md-button-filled md-button-secondary w-full sm:w-auto"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span class="md-label-large"
              >Add Player ({{ 4 - formData.players.length }} remaining)</span
            >
          </button>

          <div
            v-if="formData.players.length >= 4"
            class="text-sm text-slate-500 italic"
          >
            Maximum of 4 players reached
          </div>
        </div>

        <!-- Global Player Validation Error -->
        <div
          v-if="playerValidationError"
          class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div class="flex items-center">
            <svg
              class="w-5 h-5 text-red-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="text-sm text-red-700 font-medium">{{
              playerValidationError
            }}</span>
          </div>
        </div>
      </div>

      <!-- Price and Status -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Price Field - Material Design 3 Number Input -->
        <div class="md-text-field-container">
          <div class="md-text-field-filled">
            <div class="md-text-field-leading-icon">
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <label
              class="md-text-field-label md-text-field-label-with-icon"
              for="price-input"
            >
              Price (IDR)
            </label>
            <input
              id="price-input"
              v-model.number="formData.price"
              type="number"
              min="1000"
              max="10000000"
              step="1000"
              placeholder="150000"
              class="md-text-field-input md-text-field-input-with-icon"
              required
              @focus="onPriceFocus"
              @blur="onPriceBlur"
              @input="validatePrice"
            />
            <div class="md-text-field-active-indicator"></div>
          </div>
          <div class="md-text-field-supporting-text">
            Enter booking price in Indonesian Rupiah (minimum IDR 1,000)
          </div>
          <div v-if="priceError" class="text-sm text-red-600 mt-1">
            {{ priceError }}
          </div>
        </div>

        <!-- Status Field - Material Design 3 -->
        <div class="md-text-field-container">
          <div class="md-text-field-filled">
            <div class="md-text-field-leading-icon">
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <label
              class="md-text-field-label md-text-field-label-with-icon"
              for="status-select"
            >
              Status
            </label>
            <select
              id="status-select"
              v-model="formData.status"
              @focus="onStatusFocus"
              @blur="onStatusBlur"
              class="md-text-field-input md-select-input md-text-field-input-with-icon"
            >
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
            </select>
            <div class="md-text-field-active-indicator"></div>
            <svg
              class="md-select-dropdown-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
          <div class="md-text-field-supporting-text">
            Booking confirmation status
          </div>
        </div>

        <!-- Payment Field - Material Design 3 -->
        <div class="md-text-field-container">
          <div class="md-text-field-filled">
            <div class="md-text-field-leading-icon">
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <label
              class="md-text-field-label md-text-field-label-with-icon"
              for="payment-select"
            >
              Payment
            </label>
            <select
              id="payment-select"
              v-model="formData.paymentStatus"
              @focus="onPaymentFocus"
              @blur="onPaymentBlur"
              class="md-text-field-input md-select-input md-text-field-input-with-icon"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
            <div class="md-text-field-active-indicator"></div>
            <svg
              class="md-select-dropdown-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
          <div class="md-text-field-supporting-text">
            Payment status for this booking
          </div>
        </div>
      </div>
    </div>

    <!-- General Error Display -->
    <div
      v-if="generalError"
      class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
    >
      <div class="flex items-center">
        <svg
          class="w-5 h-5 text-red-600 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="text-red-700 font-medium">{{ generalError }}</span>
      </div>
    </div>

    <!-- Action Buttons - Material Design 3 -->
    <div
      class="flex justify-end items-center gap-4 pt-8 mt-8 border-t border-slate-200"
    >
      <!-- Cancel Button - Material Design Text Button -->
      <button type="button" @click="$emit('cancel')" class="md-button-text">
        <span class="md-label-large">Cancel</span>
      </button>

      <!-- Delete Button - Material Design Filled Button (Error) -->
      <button
        v-if="isEditMode"
        type="button"
        @click="handleDelete"
        class="md-button-filled md-button-error"
      >
        <svg
          class="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        <span class="md-label-large">Delete</span>
      </button>

      <!-- Submit Button - Material Design Filled Button (Primary) -->
      <button
        type="submit"
        :disabled="isSubmitting"
        class="md-button-filled md-button-primary"
      >
        <svg
          v-if="isSubmitting"
          class="animate-spin w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <svg
          v-else
          class="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span class="md-label-large">
          {{ isSubmitting ? 'Creating...' : isEditMode ? 'Update' : 'Create' }}
          Booking
          {{
            selectedSlots.length > 1 && batchMode
              ? ` (${selectedSlots.length})`
              : ''
          }}
        </span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
/**
 * BookingForm Component - Contact Information Data Sources
 *
 * VENUE CONTACT INFORMATION (Automatic):
 * - Email: Populated from authenticated venue owner's profile (personalInfo.email)
 * - Source: VenueOwnerService.getVenueOwnerProfile()
 * - Validation: Validated during venue owner profile creation/update
 *
 * CUSTOMER/PLAYER INFORMATION (Manual Input):
 * - Player Names: Manual input fields for up to 4 customers/players
 * - Player Phone Numbers: Manual input fields for customer contact information
 * - Source: Form input fields in this component
 * - Validation: Validated during booking creation
 *
 * Note: Venue phone contact has been removed - only player phone numbers are used
 *
 * The booking system distinguishes between:
 * 1. Venue contact details (for business communication) - from authenticated profile
 * 2. Customer/player details (for booking participants) - from manual form input
 */
import { ref, watch, onMounted, nextTick } from 'vue'
import { ValidationUtils } from '../utils/validation'

interface Props {
  selectedSlots: Array<{
    id: string
    start: string
    end: string
    startTime: Date
    endTime: Date
  }>
  paddleFields: string[]
  isEditMode: boolean
  editingBooking: {
    id: string
    title: string
    start: Date
    end: Date
    type: string
    players?: string[]        // Customer/player names (manual input)
    playerPhones?: string[]   // Customer/player phone numbers (manual input)
    contact?: string          // Venue contact email (from authenticated venue owner profile)
    price?: number
    status?: string
    paymentStatus?: string
    reason?: string
    court?: string
  } | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  create: [bookingData: Record<string, unknown>]
  update: [bookingId: string, bookingData: Record<string, unknown>]
  delete: [bookingId: string]
  cancel: []
  removeSlot: [index: number]
}>()

const formData = ref({
  type: 'booking',
  title: '',
  startTime: '',
  endTime: '',
  court: '',
  players: ['', '', '', ''],
  playerPhones: ['', '', '', ''],
  price: 150000,
  status: 'confirmed',
  paymentStatus: 'pending',
})

const formatEndTime = () => {
  if (formData.value.endTime) {
    const endDate = new Date(formData.value.endTime)
    return endDate.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }
  return ''
}

const formatStartTime = () => {
  if (formData.value.startTime) {
    const startDate = new Date(formData.value.startTime)
    return startDate.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }
  return ''
}

const getMinDateTime = () => {
  const now = new Date()
  return now.toISOString().slice(0, 16)
}

// Helper function to handle datetime input changes and clear validation
const handleDateTimeChange = (inputId: string) => {
  const input = document.getElementById(inputId) as HTMLInputElement
  if (input) {
    input.setCustomValidity('')
  }

  // Special handling for start time changes
  if (inputId === 'start-time-input') {
    handleStartTimeChange()
  } else {
    validateTimeRange()
  }
}

// Handle start time changes with dynamic end time validation
const handleStartTimeChange = () => {
  if (!formData.value.startTime || !formData.value.endTime) {
    validateTimeRange()
    return
  }

  const startDate = new Date(formData.value.startTime)
  const endDate = new Date(formData.value.endTime)

  // Check if start time is valid
  if (isNaN(startDate.getTime())) {
    validateTimeRange()
    return
  }

  // If end time becomes invalid (before start time), auto-adjust it
  if (!isNaN(endDate.getTime()) && endDate <= startDate) {
    // Automatically set end time to 15 minutes after start time (minimum duration)
    const newEndTime = new Date(startDate.getTime() + 15 * 60 * 1000)
    formData.value.endTime = newEndTime.toISOString().slice(0, 16)
    console.log('Auto-adjusted end time to:', formData.value.endTime)
  }

  validateTimeRange()
}

// Material Design 3 focus/blur handlers for enhanced UX
const onStartTimeFocus = (event: Event) => {
  const container = (event.target as HTMLElement).closest(
    '.md-text-field-filled'
  )
  container?.classList.add('md-text-field-focused')
}

const onStartTimeBlur = (event: Event) => {
  const container = (event.target as HTMLElement).closest(
    '.md-text-field-filled'
  )
  container?.classList.remove('md-text-field-focused')

  // Clear HTML5 validation state
  const input = event.target as HTMLInputElement
  input.setCustomValidity('')

  // Run custom validation
  validateTimeRange()
}

const onCourtFocus = (event: Event) => {
  const container = (event.target as HTMLElement).closest(
    '.md-text-field-filled'
  )
  container?.classList.add('md-text-field-focused')
}

const onCourtBlur = (event: Event) => {
  const container = (event.target as HTMLElement).closest(
    '.md-text-field-filled'
  )
  container?.classList.remove('md-text-field-focused')
}

const onTitleFocus = (event: Event) => {
  const container = (event.target as HTMLElement).closest(
    '.md-text-field-filled'
  )
  container?.classList.add('md-text-field-focused')
}

const onTitleBlur = (event: Event) => {
  const container = (event.target as HTMLElement).closest(
    '.md-text-field-filled'
  )
  container?.classList.remove('md-text-field-focused')
}

const onPriceFocus = (event: Event) => {
  const container = (event.target as HTMLElement).closest(
    '.md-text-field-filled'
  )
  container?.classList.add('md-text-field-focused')
}

const onPriceBlur = (event: Event) => {
  const container = (event.target as HTMLElement).closest(
    '.md-text-field-filled'
  )
  container?.classList.remove('md-text-field-focused')
}

const onStatusFocus = (event: Event) => {
  const container = (event.target as HTMLElement).closest(
    '.md-text-field-filled'
  )
  container?.classList.add('md-text-field-focused')
}

const onStatusBlur = (event: Event) => {
  const container = (event.target as HTMLElement).closest(
    '.md-text-field-filled'
  )
  container?.classList.remove('md-text-field-focused')
}

const onPaymentFocus = (event: Event) => {
  const container = (event.target as HTMLElement).closest(
    '.md-text-field-filled'
  )
  container?.classList.add('md-text-field-focused')
}

const onPaymentBlur = (event: Event) => {
  const container = (event.target as HTMLElement).closest(
    '.md-text-field-filled'
  )
  container?.classList.remove('md-text-field-focused')
}

const onPlayerNameFocus = (event: Event) => {
  const container = (event.target as HTMLElement).closest(
    '.md-text-field-filled'
  )
  container?.classList.add('md-text-field-focused')
}

const onPlayerPhoneFocus = (event: Event) => {
  const container = (event.target as HTMLElement).closest(
    '.md-text-field-filled'
  )
  container?.classList.add('md-text-field-focused')
}

const onPlayerPhoneBlur = (event: Event) => {
  const container = (event.target as HTMLElement).closest(
    '.md-text-field-filled'
  )
  container?.classList.remove('md-text-field-focused')
}

const onPlayerPhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  // Allow only numbers, +, -, and spaces
  const sanitized = value.replace(/[^0-9+\-\s]/g, '')

  if (sanitized !== value) {
    target.value = sanitized
    // Update the corresponding playerPhones array
    const index = parseInt(target.id.split('-')[2])
    if (!isNaN(index)) {
      formData.value.playerPhones[index] = sanitized
    }
  }
}

// New functions for end time and price validation
const focusStartTimeInput = () => {
  const input = document.getElementById('start-time-input') as HTMLInputElement
  if (input) {
    // Force 24-hour format attributes
    input.setAttribute('data-format', '24')
    input.setAttribute('data-time-format', '24')
    input.focus()
    input.showPicker?.()
  }
}

const focusEndTimeInput = () => {
  const input = document.getElementById('end-time-input') as HTMLInputElement
  if (input) {
    // Force 24-hour format attributes
    input.setAttribute('data-format', '24')
    input.setAttribute('data-time-format', '24')
    input.focus()
    input.showPicker?.()
  }
}

const onEndTimeFocus = (event: Event) => {
  const container = (event.target as HTMLElement).closest(
    '.md-text-field-filled'
  )
  container?.classList.add('md-text-field-focused')
}

const onEndTimeBlur = (event: Event) => {
  const container = (event.target as HTMLElement).closest(
    '.md-text-field-filled'
  )
  container?.classList.remove('md-text-field-focused')

  // Clear HTML5 validation state
  const input = event.target as HTMLInputElement
  input.setCustomValidity('')

  // Run custom validation
  validateTimeRange()
}

const getMinEndDateTime = () => {
  if (!formData.value.startTime) return ''

  // Set minimum end time to 15 minutes after start time (matching validation logic)
  const startDate = new Date(formData.value.startTime)
  startDate.setMinutes(startDate.getMinutes() + 15)

  return startDate.toISOString().slice(0, 16)
}

const validateTimeRange = () => {
  // Clear HTML5 validation state for both datetime inputs
  const startInput = document.getElementById('start-time-input') as HTMLInputElement
  const endInput = document.getElementById('end-time-input') as HTMLInputElement

  if (startInput) startInput.setCustomValidity('')
  if (endInput) endInput.setCustomValidity('')

  if (!formData.value.startTime || !formData.value.endTime) {
    timeRangeError.value = ''
    return true
  }

  const startDate = new Date(formData.value.startTime)
  const endDate = new Date(formData.value.endTime)

  // Check for invalid dates
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    timeRangeError.value = 'Please select valid start and end times'
    return false
  }

  // Check if end time is after start time
  if (endDate <= startDate) {
    timeRangeError.value = 'End time must be after start time'
    return false
  }

  // Check minimum duration (15 minutes)
  const diffMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60)
  if (diffMinutes < 15) {
    timeRangeError.value = 'Booking must be at least 15 minutes'
    return false
  }

  // Check if booking is longer than 24 hours
  const diffHours = diffMinutes / 60
  if (diffHours > 24) {
    timeRangeError.value = 'Booking cannot exceed 24 hours'
    return false
  }

  // Check if booking is in the past
  const now = new Date()
  if (startDate < now) {
    timeRangeError.value = 'Booking cannot be in the past'
    return false
  }

  timeRangeError.value = ''
  return true
}

const validatePrice = () => {
  const price = formData.value.price

  if (!price || price < 1000) {
    priceError.value = 'Price must be at least IDR 1,000'
    return false
  }

  if (price > 10000000) {
    priceError.value = 'Price cannot exceed IDR 10,000,000'
    return false
  }

  priceError.value = ''
  return true
}

// Comprehensive form validation
const validateForm = () => {
  console.log('Running comprehensive form validation...')

  // Check court selection
  if (!formData.value.court || typeof formData.value.court !== 'string' || !formData.value.court.trim()) {
    console.log('Validation failed: No court selected')
    return { isValid: false, error: 'Please select a court' }
  }

  // Check title
  if (!formData.value.title || typeof formData.value.title !== 'string' || !formData.value.title.trim()) {
    console.log('Validation failed: No title provided')
    return { isValid: false, error: 'Please enter a booking title' }
  }

  // Check datetime for flexible duration booking
  if (props.selectedSlots.length === 0) {
    if (!formData.value.startTime || !formData.value.endTime) {
      console.log('Validation failed: Missing datetime values')
      return { isValid: false, error: 'Please select both start and end times' }
    }

    // Validate time range for flexible bookings
    if (!validateTimeRange()) {
      console.log('Validation failed: Invalid time range')
      return {
        isValid: false,
        error: timeRangeError.value || 'Invalid time range selected',
      }
    }
  }

  // Check players
  const validPlayers = formData.value.players.filter((p) => p && typeof p === 'string' && p.trim())
  if (validPlayers.length === 0) {
    console.log('Validation failed: No players provided')
    return { isValid: false, error: 'At least one player is required' }
  }

  // Validate price
  if (!validatePrice()) {
    console.log('Validation failed: Invalid price')
    return { isValid: false, error: priceError.value || 'Invalid price' }
  }

  console.log('All form validations passed')
  return { isValid: true }
}

const calculateDuration = () => {
  if (!formData.value.startTime || !formData.value.endTime) {
    return 'Not set'
  }

  const startDate = new Date(formData.value.startTime)
  const endDate = new Date(formData.value.endTime)
  const diffMs = endDate.getTime() - startDate.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffMinutes = (diffMs % (1000 * 60 * 60)) / (1000 * 60)

  if (diffHours < 1) {
    return `${Math.round(diffMinutes)} minutes`
  } else if (diffMinutes === 0) {
    return `${Math.floor(diffHours)} ${diffHours === 1 ? 'hour' : 'hours'}`
  } else {
    return `${Math.floor(diffHours)}h ${Math.round(diffMinutes)}m`
  }
}

const batchMode = ref(false)
const isSubmitting = ref(false)
const playerValidationError = ref('')
const timeRangeError = ref('')
const priceError = ref('')
const generalError = ref('')

const formatDateTime = (date: Date) => {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const getDuration = (start: Date, end: Date) => {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

const getSlotsSummary = () => {
  if (props.selectedSlots.length === 0) return ''
  if (props.selectedSlots.length === 1) return 'Single slot'

  const totalDuration = props.selectedSlots.reduce((total, slot) => {
    const diff = new Date(slot.end).getTime() - new Date(slot.start).getTime()
    return total + diff
  }, 0)

  const hours = Math.floor(totalDuration / (1000 * 60 * 60))
  const minutes = Math.floor((totalDuration % (1000 * 60 * 60)) / (1000 * 60))
  return `Total: ${hours}h ${minutes}m`
}

const addPlayer = () => {
  if (formData.value.players.length < 4) {
    formData.value.players.push('')
    formData.value.playerPhones.push('')
    playerValidationError.value = ''
  }
}

const removePlayer = (index: number) => {
  if (formData.value.players.length > 1 && index > 0) {
    formData.value.players.splice(index, 1)
    formData.value.playerPhones.splice(index, 1)
    validatePlayers()
  }
}

const getPlayerValidationClass = (player: string, index: number) => {
  if (index === 0 && (!player || typeof player !== 'string' || !player.trim())) {
    return 'border-red-300 focus:ring-red-400 focus:border-red-400'
  }
  if (player && typeof player === 'string' && player.trim()) {
    return 'border-green-300 focus:ring-green-400 focus:border-green-400'
  }
  return 'border-slate-300 focus:ring-yellow-400 focus:border-yellow-400'
}

const validatePlayerName = (index: number) => {
  const player = formData.value.players[index]
  if (index === 0 && (!player || typeof player !== 'string' || !player.trim())) {
    playerValidationError.value = 'Main player name is required'
    return false
  }
  validatePlayers()
  return true
}

const validatePlayers = () => {
  const validation = ValidationUtils.validatePlayers(formData.value.players)
  if (!validation.isValid) {
    playerValidationError.value = validation.error || ''
    return false
  }
  playerValidationError.value = ''
  return true
}

const removeSlot = (index: number) => {
  emit('removeSlot', index)
}

const toggleBatchMode = () => {
  batchMode.value = !batchMode.value
}

const handleSubmit = async () => {
  console.log('Form submission started')
  console.log('Form data:', formData.value)
  console.log('Selected slots:', props.selectedSlots)

  // Clear previous errors
  generalError.value = ''
  timeRangeError.value = ''
  playerValidationError.value = ''
  priceError.value = ''

  // Run comprehensive validation
  const validation = validateForm()
  if (!validation.isValid) {
    console.log('Form validation failed:', validation.error)
    generalError.value = validation.error || 'Please check all required fields'
    return
  }

  // Run specific validations only if not already validated in validateForm
  if (!validatePlayers()) {
    console.log('Player validation failed')
    return
  }

  console.log('All validations passed, starting submission...')
  isSubmitting.value = true

  try {
    const baseData = {
      court: formData.value.court,
      type: 'booking',
    }
    console.log('Base data created:', baseData)

    // Handle regular bookings
    const validPlayers = formData.value.players.filter((p) => p && typeof p === 'string' && p.trim())
    const validPlayerPhones = formData.value.playerPhones.filter(
      (p, index) =>
        formData.value.players[index] &&
        typeof formData.value.players[index] === 'string' &&
        formData.value.players[index].trim() &&
        p &&
        typeof p === 'string' &&
        p.trim()
    )

    if (props.selectedSlots.length > 1 && batchMode.value) {
      // Batch create bookings with sequential processing
      for (let i = 0; i < props.selectedSlots.length; i++) {
        const slot = props.selectedSlots[i]
        const bookingData = {
          ...baseData,
          title: `${formData.value.title} ${props.selectedSlots.length > 1 ? `(${i + 1}/${props.selectedSlots.length})` : ''}`,
          start: slot.start,
          end: slot.end,
          players: validPlayers,
          playerPhones: validPlayerPhones,
          price: formData.value.price,
          status: formData.value.status,
          paymentStatus: formData.value.paymentStatus,
        }
        emit('create', bookingData)
      }
    } else {
      // Single booking
      let startTime, endTime

      if (props.selectedSlots.length > 0) {
        startTime = props.selectedSlots[0].start
        endTime = props.selectedSlots[props.selectedSlots.length - 1].end
      } else {
        // Convert datetime-local format to ISO string for backend
        startTime = new Date(formData.value.startTime).toISOString()
        endTime = new Date(formData.value.endTime).toISOString()
      }

      console.log('Converted datetime values:', { startTime, endTime })

      const bookingData = {
        ...baseData,
        title: formData.value.title,
        start: startTime,
        end: endTime,
        players: validPlayers,
        playerPhones: validPlayerPhones,
        price: formData.value.price,
        status: formData.value.status,
        paymentStatus: formData.value.paymentStatus,
      }

      console.log('Final booking data:', bookingData)

      if (props.isEditMode && props.editingBooking) {
        console.log('Emitting update event')
        emit('update', props.editingBooking.id, bookingData)
      } else {
        console.log('Emitting create event')
        emit('create', bookingData)
      }
    }
    console.log('Form submission completed successfully')
  } catch (error) {
    console.error('Form submission error:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = () => {
  if (
    props.editingBooking &&
    confirm('Are you sure you want to delete this booking?')
  ) {
    emit('delete', props.editingBooking.id)
  }
}

// Initialize form data when editing
watch(
  () => props.editingBooking,
  (booking) => {
    if (booking && props.isEditMode) {
      const players = booking.players || []
      const playerPhones = booking.playerPhones || []

      // Ensure we have at least 1 player slot, max 4
      const playerSlots = [...players]
      const phoneSlots = [...playerPhones]

      while (playerSlots.length < 1) playerSlots.push('')
      while (playerSlots.length < 4) playerSlots.push('')
      while (phoneSlots.length < playerSlots.length) phoneSlots.push('')

      // Clear validation errors when editing
      playerValidationError.value = ''

      formData.value = {
        type: 'booking',
        title: booking.title || '',
        startTime: booking.start
          ? new Date(booking.start).toISOString().slice(0, 16)
          : '',
        endTime: booking.end
          ? new Date(booking.end).toISOString().slice(0, 16)
          : '',
        court: booking.court || '',
        players: playerSlots,
        playerPhones: phoneSlots,
        price: booking.price || 150000,
        status: booking.status || 'confirmed',
        paymentStatus: booking.paymentStatus || 'pending',
      }
    }
  },
  { immediate: true }
)

// Force 24-hour format on datetime inputs - Enhanced
const force24HourFormat = () => {
  const startTimeInput = document.getElementById(
    'start-time-input'
  ) as HTMLInputElement
  const endTimeInput = document.getElementById(
    'end-time-input'
  ) as HTMLInputElement

  const applyFormat = (input: HTMLInputElement) => {
    if (input) {
      // Multiple attributes for maximum browser compatibility
      input.setAttribute('data-format', '24')
      input.setAttribute('data-time-format', '24')
      input.setAttribute('lang', 'en-GB')
      input.setAttribute('locale', 'en-GB')

      // Force step to ensure proper time increments
      input.setAttribute('step', '900') // 15 minutes

      // Set CSS custom property for styling
      input.style.setProperty('--time-format', '24')

      // Additional browser-specific attributes
      input.setAttribute('data-locale', 'en-GB')
      input.setAttribute('data-hour-format', '24')

      // Add multiple event listeners to maintain format
      const maintainFormat = () => {
        input.setAttribute('lang', 'en-GB')
        input.setAttribute('data-format', '24')
      }

      input.addEventListener('focus', maintainFormat)
      input.addEventListener('click', maintainFormat)
      input.addEventListener('input', maintainFormat)

      // Force browser to recognize 24-hour format
      if (input.value) {
        const currentValue = input.value
        input.value = ''
        setTimeout(() => {
          input.value = currentValue
          maintainFormat()
        }, 10)
      }
    }
  }

  applyFormat(startTimeInput)
  applyFormat(endTimeInput)
}

onMounted(() => {
  // Set default times if no slots selected - default to next hour for flexible duration booking
  if (props.selectedSlots.length === 0 && !props.isEditMode) {
    const now = new Date()
    now.setMinutes(0, 0, 0)
    now.setHours(now.getHours() + 1) // Start from next hour

    formData.value.startTime = now.toISOString().slice(0, 16)

    // Set default end time to 2 hours after start time
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    formData.value.endTime = endTime.toISOString().slice(0, 16)
  }

  // Initialize with minimum required player slots
  if (formData.value.players.length === 0) {
    formData.value.players = ['', '', '', '']
    formData.value.playerPhones = ['', '', '', '']
  }

  // Ensure 24-hour format is applied after DOM is ready
  setTimeout(() => {
    force24HourFormat()
  }, 100)

  // Re-apply format when component updates
  setTimeout(() => {
    force24HourFormat()
  }, 500)
})

// Watch for changes and reapply 24-hour format
watch([() => formData.value.startTime, () => formData.value.endTime], () => {
  nextTick(() => {
    force24HourFormat()
    // Auto-validate time range when times change
    if (formData.value.startTime && formData.value.endTime) {
      validateTimeRange()
    }
  })
})
</script>

<style scoped>
/* ========================================
   Material Design 3 Text Field Components
   ======================================== */

.md-text-field-container {
  width: 100%;
  margin-bottom: 24px; /* 8dp grid: 3 units - Standard Material Design spacing */
  position: relative;
  z-index: 1;
  isolation: isolate; /* Create new stacking context to prevent overlap */
}

.md-text-field-filled {
  position: relative;
  border-radius: 8px 8px 0 0;
  border-bottom: 2px solid;
  transition: all 200ms ease;
  background-color: #fefce8; /* MaBar Light Cream background */
  border-bottom-color: #64748b; /* MaBar Subtle Gray */
  min-height: 56px; /* Material Design 3 standard height */
  z-index: 1;
  display: flex;
  align-items: center;
}

/* Leading Icon Positioning - Enhanced */
.md-text-field-leading-icon {
  position: absolute;
  left: 18px; /* Slightly more spacing from edge */
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  color: #64748b; /* MaBar Subtle Gray */
  transition: color 200ms ease;
  pointer-events: none;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.md-text-field-filled.md-text-field-focused .md-text-field-leading-icon {
  color: #fde047; /* MaBar Primary Yellow */
}

/* Label positioning with and without icons - Fixed positioning */
.md-text-field-label {
  position: absolute;
  left: 16px;
  top: 50%; /* Center vertically in the field */
  transform: translateY(-50%); /* Perfect vertical centering */
  color: #64748b; /* MaBar Subtle Gray */
  font-size: 16px;
  font-weight: 400;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  z-index: 3; /* Increased z-index to prevent interference */
  background-color: transparent;
  padding: 0 4px;
  transform-origin: left center;
  isolation: isolate; /* Prevent interference with adjacent fields */
}

.md-text-field-label-with-icon {
  left: 56px; /* 16px + 20px icon + 20px spacing to match input padding */
}

/* Input positioning with and without icons - Fixed padding */
.md-text-field-input {
  width: 100%;
  min-height: 56px;
  padding: 28px 16px 12px 16px; /* Increased top padding for floating label clearance */
  background: transparent;
  border: none;
  color: #334155; /* MaBar Charcoal */
  font-size: 16px;
  font-weight: 400;
  outline: none;
  z-index: 1;
  line-height: 1.5;
  box-sizing: border-box;
}

.md-text-field-input-with-icon {
  padding-left: 56px; /* 16px + 20px icon + 20px spacing for better clearance */
}

.md-text-field-filled:hover {
  background-color: #fef3c7; /* Slightly darker cream on hover */
  border-bottom-color: #334155; /* MaBar Charcoal text color */
}

.md-text-field-filled.md-text-field-focused {
  border-bottom-color: #fde047; /* MaBar Primary Yellow */
  background-color: #fffbeb; /* Slightly warmer white on focus */
  z-index: 2;
  box-shadow: 0 2px 4px rgba(253, 224, 71, 0.1);
}

/* Active indicator styling */
.md-text-field-active-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: transparent;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 0 8px 8px;
}

.md-text-field-filled.md-text-field-focused .md-text-field-active-indicator {
  background-color: #fde047; /* MaBar Primary Yellow */
  height: 3px;
}

/* Floating label behavior - Enhanced positioning */
.md-text-field-filled.md-text-field-focused .md-text-field-label,
.md-text-field-filled:has(.md-text-field-input:not(:placeholder-shown))
  .md-text-field-label {
  transform: translateY(-40px) scale(0.75); /* Increased distance to prevent overlap */
  color: #fde047; /* MaBar Primary Yellow */
  background-color: #fefce8; /* Match field background */
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  top: 0px; /* Positioned well above the field */
  z-index: 4;
}

.md-text-field-filled.md-text-field-focused .md-text-field-label-with-icon,
.md-text-field-filled:has(.md-text-field-input:not(:placeholder-shown))
  .md-text-field-label-with-icon {
  transform: translateY(-40px) scale(0.75); /* Increased distance to prevent overlap */
  left: 56px; /* Match updated icon spacing */
  top: 0px; /* Positioned well above the field */
  z-index: 4;
}

/* Alternative floating trigger for better browser compatibility */
.md-text-field-input:focus ~ .md-text-field-label,
.md-text-field-input:not(:placeholder-shown) ~ .md-text-field-label {
  transform: translateY(-40px) scale(0.75); /* Increased distance to prevent overlap */
  color: #fde047;
  background-color: #fefce8;
  top: 0px; /* Positioned well above the field */
  z-index: 4;
}

.md-text-field-input:focus ~ .md-text-field-label-with-icon,
.md-text-field-input:not(:placeholder-shown) ~ .md-text-field-label-with-icon {
  left: 56px;
  top: 0px; /* Positioned well above the field */
}

.md-text-field-input::placeholder {
  color: transparent;
}

.md-text-field-input:focus::placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

/* Select-specific styles */
.md-select-input {
  appearance: none;
  cursor: pointer;
  background-image: none;
}

.md-select-dropdown-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  pointer-events: none;
  transition: transform 200ms ease;
  color: #64748b; /* MaBar Subtle Gray */
  z-index: 3; /* Higher z-index to appear above icons and labels */
}

/* Ensure dropdown arrow doesn't overlap with leading icons */
.md-text-field-filled:has(.md-text-field-leading-icon)
  .md-select-dropdown-icon {
  right: 16px; /* Maintain right position regardless of leading icon */
}

.md-text-field-filled.md-text-field-focused .md-select-dropdown-icon {
  transform: translateY(-50%) rotate(180deg);
  color: #fde047; /* MaBar Primary Yellow */
}

.md-text-field-supporting-text {
  margin-top: 8px; /* 8dp grid: 1 unit */
  margin-bottom: 4px; /* Prevent interference with adjacent elements */
  padding: 0 16px;
  color: #64748b; /* MaBar Subtle Gray */
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5; /* Improved readability */
  letter-spacing: 0.4px;
  min-height: 18px; /* Prevent layout shift */
  display: block;
  clear: both;
  word-wrap: break-word;
  overflow-wrap: break-word;
  box-sizing: border-box;
}

/* Focus states for accessibility */
.md-text-field-input:focus {
  outline: none;
}

.md-text-field-filled:focus-within {
  border-bottom-color: #fde047; /* MaBar Primary Yellow */
  background-color: #ffffff; /* MaBar Surface White */
  box-shadow: 0 2px 8px rgba(253, 224, 71, 0.2); /* Subtle yellow glow */
}

.md-text-field-filled:focus-within .md-text-field-label {
  color: #fde047; /* MaBar Primary Yellow */
}

/* Error states */
.md-text-field-filled.md-text-field-error {
  border-bottom-color: #ef4444; /* Red error color */
  background-color: #fef2f2; /* Light red background */
}

.md-text-field-filled.md-text-field-error .md-text-field-label {
  color: #ef4444; /* Red error color */
}

.md-text-field-filled.md-text-field-error .md-text-field-supporting-text {
  color: #ef4444; /* Red error color */
}

/* Disabled states */
.md-text-field-filled:has(.md-text-field-input:disabled) {
  background-color: #f8fafc; /* Light gray background */
  border-bottom-color: #e2e8f0; /* Light gray border */
  opacity: 0.6;
}

.md-text-field-filled:has(.md-text-field-input:disabled) .md-text-field-label {
  color: #94a3b8; /* Muted gray text */
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .md-text-field-label {
    font-size: 14px;
  }

  .md-text-field-input {
    font-size: 14px;
    padding-top: 20px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .md-text-field-filled {
    border: 2px solid;
    border-color: var(--md-sys-color-outline);
  }

  .md-text-field-filled.md-text-field-focused {
    border-color: var(--md-sys-color-primary);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .md-text-field-filled,
  .md-text-field-label,
  .md-text-field-active-indicator,
  .md-select-dropdown-icon {
    transition: none;
  }
}

/* Form layout improvements */
.booking-form-section {
  margin-bottom: 32px; /* 8dp grid: 4 units */
  clear: both;
}

.booking-form-section:last-child {
  margin-bottom: 0;
}

/* Prevent field overlap */
.md-text-field-container + .md-text-field-container {
  margin-top: 24px; /* 8dp grid: 3 units */
}

/* Z-index stacking is now handled in the main .md-text-field-filled selectors above */

/* Card spacing improvements */
.md-card {
  margin: 24px 0; /* 8dp grid: 3 units */
}

.md-card + .md-card {
  margin-top: 32px; /* 8dp grid: 4 units */
}

/* Material Design 3 Button Styles */
.md-button-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 10px 12px;
  border: none;
  border-radius: 20px;
  background: transparent;
  color: #fde047; /* MaBar Primary Yellow */
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.1px;
  cursor: pointer;
  transition: all 200ms ease;
  position: relative;
  overflow: hidden;
}

.md-button-text:hover {
  background-color: rgba(253, 224, 71, 0.08);
}

.md-button-text:focus {
  outline: none;
  background-color: rgba(253, 224, 71, 0.12);
}

.md-button-text:active {
  background-color: rgba(253, 224, 71, 0.16);
}

.md-button-filled {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 10px 24px;
  border: none;
  border-radius: 20px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.1px;
  cursor: pointer;
  transition: all 200ms ease;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.3),
    0 1px 3px 1px rgba(0, 0, 0, 0.15);
}

.md-button-filled:hover {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.3),
    0 2px 6px 2px rgba(0, 0, 0, 0.15);
}

.md-button-filled:focus {
  outline: none;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.3),
    0 2px 6px 2px rgba(0, 0, 0, 0.15);
}

.md-button-filled:active {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.3),
    0 1px 3px 1px rgba(0, 0, 0, 0.15);
}

.md-button-primary {
  background-color: #fde047; /* MaBar Primary Yellow */
  color: #334155; /* MaBar Charcoal */
}

.md-button-primary:hover {
  background-color: #fef08a; /* Lighter yellow on hover */
}

.md-button-primary:disabled {
  background-color: #e2e8f0; /* MaBar Light Gray */
  color: #94a3b8; /* MaBar Muted Gray */
  cursor: not-allowed;
  box-shadow: none;
}

.md-button-error {
  background-color: #ef4444; /* Red */
  color: #ffffff;
}

.md-button-error:hover {
  background-color: #dc2626; /* Darker red on hover */
}

.md-button-secondary {
  background-color: #f1f5f9; /* Light slate background */
  color: #475569; /* Slate text */
  border: 1px solid #cbd5e1; /* Slate border */
}

.md-button-secondary:hover {
  background-color: #e2e8f0; /* Darker slate on hover */
  border-color: #94a3b8;
}

.md-button-secondary:disabled {
  background-color: #f8fafc;
  color: #cbd5e1;
  border-color: #e2e8f0;
  cursor: not-allowed;
}

/* Material Design Typography Classes */
.md-headline-small {
  font-size: 24px;
  line-height: 32px;
  font-weight: 400;
  letter-spacing: 0px;
}

.md-headline-medium {
  font-size: 28px;
  line-height: 36px;
  font-weight: 400;
  letter-spacing: 0px;
}

.md-body-medium {
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  letter-spacing: 0.25px;
}

.md-label-large {
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  letter-spacing: 0.1px;
}

/* Material Design Color Classes */
.text-on-surface {
  color: #334155; /* MaBar Charcoal */
}

.text-on-surface-variant {
  color: #64748b; /* MaBar Subtle Gray */
}

.text-primary {
  color: #fde047; /* MaBar Primary Yellow */
}

.bg-surface-variant {
  background-color: #f8fafc; /* MaBar Light Background */
}

.bg-primary {
  background-color: #fde047; /* MaBar Primary Yellow */
}

/* Responsive Design Improvements */
@media (max-width: 768px) {
  .md-text-field-container {
    margin-bottom: 24px; /* Consistent spacing on mobile */
  }

  .md-text-field-filled {
    min-height: 56px; /* Maintain standard height on mobile */
  }

  .md-text-field-input {
    font-size: 16px; /* Prevent zoom on iOS */
    min-height: 56px;
    padding: 28px 16px 12px 16px; /* Match desktop padding */
  }

  .md-text-field-input-with-icon {
    padding-left: 56px; /* Match desktop spacing */
  }

  .md-text-field-label {
    top: 50%; /* Match desktop positioning */
    transform: translateY(-50%); /* Perfect vertical centering */
  }

  .md-text-field-label-with-icon {
    left: 56px; /* Match desktop spacing */
  }

  .md-text-field-leading-icon {
    left: 18px; /* Match desktop positioning */
    width: 20px;
    height: 20px;
  }

  /* Player section mobile improvements */
  .player-row {
    flex-direction: column;
    gap: 16px; /* Consistent gap for mobile */
    padding: 16px;
    background-color: #fefce8;
    border-radius: 12px;
    margin-bottom: 24px; /* Consistent bottom margin */
  }

  .player-row .flex-1 {
    grid-template-columns: 1fr; /* Single column on mobile */
    gap: 16px; /* Consistent gap for mobile */
  }

  /* Remove additional margins on mobile for cleaner layout */
  .player-row .grid .md-text-field-container:first-child,
  .player-row .grid .md-text-field-container:last-child {
    margin-left: 0;
    margin-right: 0;
  }

  /* Booking summary responsive improvements */
  .md-card {
    margin: 16px 0; /* Reduced margins on mobile */
  }

  /* Button improvements for mobile */
  .md-button-filled {
    min-height: 48px; /* Larger touch targets on mobile */
    padding: 14px 24px;
    width: 100%; /* Full width on mobile */
  }

  .md-button-text {
    min-height: 48px;
    padding: 14px 16px;
  }
}

/* Focus improvements for accessibility */
.md-text-field-input:focus,
.md-select-input:focus {
  outline: 2px solid #fde047;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .md-text-field-filled {
    border-bottom-width: 3px;
  }

  .md-text-field-leading-icon,
  .md-text-field-label {
    color: #000000;
  }

  .md-text-field-filled.md-text-field-focused .md-text-field-leading-icon,
  .md-text-field-filled.md-text-field-focused .md-text-field-label {
    color: #000000;
  }
}

/* Clickable field styling */
.md-text-field-clickable {
  cursor: pointer;
}

.md-text-field-clickable:hover {
  background-color: #fffbeb; /* Slightly lighter cream on hover */
}

/* Enhanced datetime inputs for 24-hour format */
input[type='datetime-local'] {
  color-scheme: light;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: textfield;
  font-variant-numeric: tabular-nums;
  /* Force 24-hour format through locale */
  -webkit-locale: 'en-GB';
}

/* Force 24-hour format in datetime picker - Enhanced */
input[type='datetime-local']::-webkit-datetime-edit-hour-field {
  color: #334155;
  font-weight: 600;
  min-width: 2ch;
  text-align: center;
}

input[type='datetime-local']::-webkit-datetime-edit-minute-field {
  color: #334155;
  font-weight: 600;
  min-width: 2ch;
  text-align: center;
}

/* Completely hide AM/PM field to force 24-hour format - Enhanced */
input[type='datetime-local']::-webkit-datetime-edit-ampm-field {
  display: none !important;
  visibility: hidden !important;
  width: 0 !important;
  height: 0 !important;
  opacity: 0 !important;
  position: absolute !important;
  left: -9999px !important;
  overflow: hidden !important;
}

/* Additional AM/PM hiding for different browser implementations */
input[type='datetime-local']::-webkit-datetime-edit-meridiem-field {
  display: none !important;
  visibility: hidden !important;
  width: 0 !important;
  height: 0 !important;
  opacity: 0 !important;
}

/* Hide the native calendar picker indicator */
input[type='datetime-local']::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 16px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  z-index: 4;
  background: transparent;
}

/* Enhanced datetime picker styling */
input[type='datetime-local']::-webkit-datetime-edit {
  color: #334155;
  font-size: 16px;
  font-weight: 400;
  display: flex;
  align-items: center;
}

input[type='datetime-local']::-webkit-datetime-edit-text {
  color: #64748b;
  padding: 0 3px;
  font-weight: 400;
}

input[type='datetime-local']::-webkit-datetime-edit-month-field,
input[type='datetime-local']::-webkit-datetime-edit-day-field,
input[type='datetime-local']::-webkit-datetime-edit-year-field {
  color: #334155;
  font-weight: 500;
  text-align: center;
}

/* Firefox specific 24-hour format support */
@-moz-document url-prefix() {
  input[type='datetime-local'] {
    appearance: textfield;
    -moz-appearance: textfield;
  }
}

/* Force 24-hour format across all browsers */
input[type='datetime-local'][data-format='24'] {
  /* Ensure 24-hour format is maintained */
  --time-format: 24;
}

/* Safari specific 24-hour format */
@media screen and (-webkit-min-device-pixel-ratio: 0) {
  input[type='datetime-local'] {
    -webkit-locale: 'en-GB';
  }
}

/* Edge/IE specific 24-hour format */
@supports (-ms-ime-align: auto) {
  input[type='datetime-local'] {
    -ms-locale: 'en-GB';
  }
}

/* Error states for Material Design fields */
.md-text-field-error {
  border-bottom-color: #ef4444 !important; /* Red border for errors */
}

.md-text-field-filled:has(.md-text-field-error) {
  border-bottom-color: #ef4444 !important;
}

.md-text-field-filled:has(.md-text-field-error) .md-text-field-leading-icon {
  color: #ef4444 !important;
}

.md-text-field-filled:has(.md-text-field-error) .md-text-field-label {
  color: #ef4444 !important;
}

/* Player section specific styling - Enhanced */
.player-row {
  transition: all 200ms ease;
  margin-bottom: 28px; /* Increased spacing between player rows for better separation */
}

.player-row:hover {
  background-color: #fefce8; /* Very light yellow on hover */
  border-radius: 12px;
  padding: 16px; /* Increased padding for better hover effect */
  margin: -16px -16px 12px -16px; /* Compensate for padding while maintaining bottom margin */
}

/* Improved spacing for player section */
.player-row .md-text-field-container {
  margin-bottom: 20px; /* Increased spacing within player row for better separation */
}

/* Ensure proper spacing between name and phone fields in player rows */
.player-row .grid .md-text-field-container:first-child {
  margin-right: 8px; /* Additional spacing between name and phone fields */
}

.player-row .grid .md-text-field-container:last-child {
  margin-left: 8px; /* Additional spacing between name and phone fields */
}

/* Ensure proper spacing in grid layout */
.player-row .grid {
  gap: 16px; /* Material Design standard spacing */
}

/* Enhanced field container spacing - merged with existing selector */

/* Form section spacing improvements */
.space-y-10 > * + * {
  margin-top: 2.5rem; /* 40px - Better separation between major sections */
}

/* Prevent excessive spacing in nested elements */
.space-y-10 .md-text-field-container + .md-text-field-container {
  margin-top: 1.5rem; /* 24px - Standard field spacing */
}

/* Enhanced field separation to prevent overlap - merged with existing selectors */

/* Enhanced focus states for better accessibility */
.md-text-field-input:focus-visible {
  outline: 2px solid #fde047;
  outline-offset: 2px;
}

/* Better button alignment in player rows */
.player-remove-button {
  transition: all 200ms ease;
  transform: scale(0.9);
}

.player-remove-button:hover {
  transform: scale(1);
}
</style>
