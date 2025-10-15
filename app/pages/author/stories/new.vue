<template>
  <div class="min-h-screen grid grid-cols-12 bg-gray-50 dark:bg-gray-900/50">
    <StoryWizardTimeline
      :wizard-steps="wizardSteps"
      :current-step="currentStep"
      :highest-step="highestStep"
      :get-step-class="getStepClass"
      :get-step-summary="getStepSummary"
      @go-to-step="(step) => currentStep = step"
      @reset="resetWizard"
    />

    <main class="col-span-6 p-8 overflow-y-auto">
      <StoryWizardStepCard
        v-if="currentStep === 1"
        title="Chọn Thể loại"
        description="Hãy chọn những thể loại phù hợp nhất với câu chuyện của bạn."
      >
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <button
            v-for="genre in genresFromAPI"
            :key="genre"
            class="p-4 border rounded-lg text-center transition-all duration-200 text-sm font-medium"
            :class="storyData.genres.includes(genre) ? 'bg-primary-500 text-white border-primary-500 ring-4 ring-primary-500/30' : 'hover:border-primary-500 hover:text-primary-500 dark:border-gray-700'"
            @click="toggleGenre(genre)"
            color="neutral"
          >
            {{ genre }}
          </button>
        </div>
      </StoryWizardStepCard>

      <StoryWizardStepCard
        v-if="currentStep === 2"
        title="Ý tưởng Cốt lõi"
        description="Viết ra prompt chi tiết nhất có thể. Đây là linh hồn của câu chuyện, là nền tảng để AI phác thảo thế giới cho bạn."
      >
        <UTextarea
          v-model="storyData.prompt"
          :rows="15"
          :placeholder="promptPlaceholder"
          class="w-full"
        />
      </StoryWizardStepCard>

      <StoryWizardStepCard
        v-if="currentStep === 3"
        title="Cài đặt Kỹ thuật"
        description="Tinh chỉnh các thông số để AI tạo ra bộ khung truyện phù hợp nhất với mong muốn của bạn."
      >
        <UForm
          :state="storyData.settings"
          class="space-y-6"
        >
          <UFormField label="Cấu trúc viết">
            <div class="grid grid-cols-2 gap-4">
              <UButton
                :variant="storyData.settings.writingStructure === 'structured' ? 'solid' : 'outline'"
                class="flex-col h-24 text-center"
                color="neutral"
                @click="storyData.settings.writingStructure = 'structured'"
              >
                <Icon
                  name="i-heroicons-squares-2x2"
                  class="w-6 h-6 mb-2"
                />
                <span class="text-sm">Có cấu trúc</span>
                <span class="text-xs font-normal opacity-70">Xác định các phần rõ ràng</span>
              </UButton>
              <UButton
                :variant="storyData.settings.writingStructure === 'open' ? 'solid' : 'outline'"
                class="flex-col h-24 text-center"
                color="neutral"
                @click="storyData.settings.writingStructure = 'open'"
              >
                <Icon
                  name="i-heroicons-sparkles"
                  class="w-6 h-6 mb-2"
                />
                <span class="text-sm">Mở</span>
                <span class="text-xs font-normal opacity-70">Tự do sáng tạo không giới hạn</span>
              </UButton>
            </div>
          </UFormField>
          <UFormField :label="`Số lượng chương: ${storyData.settings.chapterCount}`">
            <USlider
              v-model="storyData.settings.chapterCount"
              :min="10"
              :max="500"
              :step="10"
            />
          </UFormField>
          <UFormField :label="`Số từ trên mỗi chương (ước tính): ${storyData.settings.wordsPerChapter}`">
            <USlider
              v-model="storyData.settings.wordsPerChapter"
              :min="500"
              :max="5000"
              :step="100"
            />
          </UFormField>
          <UFormField
            :label="`Độ sâu bộ nhớ AI: ${storyData.settings.memoryDepth}`"
            help="Mức độ AI ghi nhớ các chi tiết từ chương trước (càng cao càng tốn kém)."
          >
            <USlider
              v-model="storyData.settings.memoryDepth"
              :min="1"
              :max="10"
            />
          </UFormField>
        </UForm>
      </StoryWizardStepCard>

      <StoryWizardStepCard
        v-if="currentStep === 4"
        title="AI Đang Phác Thảo"
        description="Kết quả sẽ sớm xuất hiện ở bước tiếp theo. Bạn có thể quay lại để chỉnh sửa các bước trước nếu muốn."
      >
        <div class="text-center py-12">
          <Icon
            v-if="isGenerating"
            name="i-lucide-wand-2"
            class="w-16 h-16 text-primary-500 animate-pulse"
          />
          <Icon
            v-else
            name="i-heroicons-check-circle-solid"
            class="w-16 h-16 text-green-500"
          />
          <h2 class="text-2xl font-bold mt-6">
            {{ isGenerating ? 'AI đang sáng thế...' : 'Phác thảo hoàn tất!' }}
          </h2>
          <p
            v-if="!isGenerating"
            class="text-gray-500 mt-2"
          >
            Nhấn "Bước tiếp theo" để xem lại và hoàn thiện.
          </p>
        </div>
      </StoryWizardStepCard>

      <StoryWizardStepCard
        v-if="currentStep === 5"
        title="Hoàn thiện & Tinh chỉnh"
        description="Rà soát và 'thêm mắm thêm muối' để các chi tiết mang đậm dấu ấn cá nhân của bạn trước khi chính thức khởi tạo."
      >
        <UForm
          :state="storyData"
          class="space-y-6"
        >
          <UFormField
            label="Tên Tác phẩm"
            name="title"
            required
          >
            <UInput
              v-model="storyData.title"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Mô tả ngắn"
            name="description"
          >
            <UTextarea
              v-model="storyData.description"
              :rows="5"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Tags (phân cách bởi dấu phẩy)"
            name="tags"
          >
            <UInput
              v-model="storyData.tags"
              class="w-full"
            />
          </UFormField>
          <USeparator
            label="Xem lại Lorebook do AI tạo"
            class="my-6"
          />
          {{ storyData }}
          <UAccordion :items="[{ label: 'Nhân vật', defaultOpen: true }, { label: 'Thế lực' }, { label: 'Cảnh giới' }]">
            <template #item="{ item }">
              <div
                v-if="item.label === 'Nhân vật'"
                class="space-y-2 text-sm text-gray-600 dark:text-gray-300"
              >
                <div
                  v-for="(char, i) in storyData.characters"
                  :key="i"
                >
                  <strong>{{ char.name }}</strong> ({{ char.role }}): {{ char.description }}
                </div>
              </div>
              <div
                v-if="item.label === 'Thế lực'"
                class="space-y-2 text-sm text-gray-600 dark:text-gray-300"
              >
                <div
                  v-for="(fac, i) in storyData.factions"
                  :key="i"
                >
                  <strong>{{ fac.name }}</strong>: {{ fac.description }}
                </div>
              </div>
              <div
                v-if="item.label === 'Cảnh giới'"
                class="space-y-2 text-sm text-gray-600 dark:text-gray-300"
              >
                <div
                  v-for="(realm, i) in storyData.realms"
                  :key="i"
                >
                  <strong>Cấp {{ realm.level }} - {{ realm.name }}</strong>: {{ realm.description }}
                </div>
              </div>
            </template>
          </UAccordion>
        </UForm>
      </StoryWizardStepCard>
    </main>

    <aside class="col-span-3 border-l border-gray-200 dark:border-gray-800 p-8 bg-white dark:bg-gray-800/50">
      <div
        v-if="tips[currentStep - 1]"
        class="sticky top-8 space-y-4"
      >
        <h3 class="font-semibold flex items-center gap-2 mb-4 text-lg">
          <Icon name="i-heroicons-light-bulb" /> Mẹo Khởi niệm
        </h3>
        <UAlert
          v-for="(tip, index) in tips[currentStep - 1].content"
          :key="index"
          :title="tip.title"
          :description="tip.description"
          :icon="tip.icon"
          color="neutral"
        />
      </div>
    </aside>

    <div class="fixed bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
      <div
        class="max-w-7xl mx-auto flex"
        :class="currentStep > 1 ? 'justify-between' : 'justify-end'"
      >
        <UButton
          v-if="currentStep > 1 && !isGenerating"
          variant="ghost"
          icon="i-heroicons-arrow-left"
          color="neutral"
          @click="prevStep"
        >
          Quay lại
        </UButton>
        <div>
          <UButton
            v-if="currentStep > 1"
            color="neutral"
            variant="ghost"
            @click="resetWizard"
          >
            Đặt lại
          </UButton>
          <UButton
            v-if="currentStep < wizardSteps.length"
            :disabled="!canProceed"
            trailing-icon="i-heroicons-arrow-right"
            color="neutral"
            @click="nextStep"
          >
            {{ currentStep === 4 && isGenerating ? 'Đang xử lý...' : 'Bước tiếp theo' }}
          </UButton>
          <UButton
            v-if="currentStep === wizardSteps.length"
            :loading="isLoading"
            icon="i-heroicons-rocket-launch"
            color="neutral"
            :to="`/author/stories/${storyData._id}`"
          >
            Hoàn tất & Đi tới Tác phẩm
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: genresFromAPI } = await useFetch<string[]>('/api/genres', { default: () => [] })
const { isLoading, isGenerating, currentStep, highestStep, storyData, canProceed, resetWizard, nextStep, prevStep, handleSubmit } = useStoryWizard()

const wizardSteps = [
  { id: 1, name: 'Thể loại' },
  { id: 2, name: 'Ý tưởng Cốt lõi' },
  { id: 3, name: 'Cài đặt Kỹ thuật' },
  { id: 4, name: 'AI Phác thảo' },
  { id: 5, name: 'Hoàn thiện' }
]
const tips = [
  { content: [{ icon: 'i-heroicons-swatch', title: 'Kết hợp', description: 'Hãy thử kết hợp 2-3 thể loại để tạo sự độc đáo.' }, { icon: 'i-heroicons-adjustments-horizontal', title: 'Ảnh hưởng', description: 'Thể loại bạn chọn sẽ ảnh hưởng lớn đến văn phong của AI.' }] },
  { content: [{ icon: 'i-heroicons-document-text', title: 'Càng chi tiết, càng tốt', description: 'Prompt càng chi tiết, AI phác thảo càng chính xác.' }, { icon: 'i-heroicons-user-group', title: 'Nền tảng', description: 'Mô tả rõ về nhân vật chính, thế giới và xung đột đầu tiên.' }] },
  { content: [{ icon: 'i-heroicons-cog', title: 'Quy mô', description: 'Số lượng chương giúp AI hình dung độ dài và phân bổ cốt truyện hợp lý.' }, { icon: 'i-heroicons-cpu-chip', title: 'Bộ nhớ', description: 'Độ sâu bộ nhớ ảnh hưởng đến khả năng AI ghi nhớ chi tiết về sau.' }] },
  { content: [{ icon: 'i-heroicons-clock', title: 'Kiên nhẫn', description: 'AI đang phân tích và xây dựng bộ khung cho thế giới truyện của bạn. Quá trình này có thể mất một lúc.' }] },
  { content: [{ icon: 'i-heroicons-paint-brush', title: 'Dấu ấn cá nhân', description: 'Rà soát và "thêm mắm thêm muối" để các chi tiết mang đậm dấu ấn của bạn.' }, { icon: 'i-heroicons-book-open', title: 'Bước tiếp theo', description: 'Sau khi khởi tạo, bạn sẽ quản lý chi tiết Lorebook và bắt đầu viết chương đầu tiên.' }] }
]
const promptPlaceholder = `Ví dụ:\n- Thể loại: Huyền huyễn, Phiêu lưu, Hài hước.\n\n- Nhân vật chính: Tên là Vĩ, một thanh niên làm nghề "shipper" cổ vật, lanh lợi, mồm mép, và có nguyên tắc sống là "không bao giờ dính vào rắc rối"...`

function getStepClass(stepId: number) {
  if (currentStep.value === stepId) return 'bg-primary-500 text-white ring-4 ring-primary-500/30'
  if (currentStep.value > stepId) return 'bg-green-500 text-white'
  return 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
}
function getStepSummary(stepId: number) {
  if (stepId === 1) return storyData.genres.join(', ')
  if (stepId === 2) return `Đã nhập ${storyData.prompt.length} ký tự`
  if (stepId === 3) return storyData.settings.writingStructure === 'structured' ? 'Có cấu trúc' : 'Mở'
  if (stepId === 4) return 'Phác thảo thành công'
  return ''
}
function toggleGenre(genre: string) {
  const index = storyData.genres.indexOf(genre)
  if (index > -1) storyData.genres.splice(index, 1)
  else storyData.genres.push(genre)
}
</script>
