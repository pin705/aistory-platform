<template>
  <UContainer>
    <div class="flex justify-between items-center my-8">
      <h1 class="text-3xl font-bold">
        Tác phẩm của tôi
      </h1>
      <UButton
        icon="i-heroicons-plus-circle"
        color="neutral"
        @click="openStoryModal(null)"
      >
        Sáng tác truyện mới
      </UButton>
    </div>

    <div
      v-if="stories && stories.length"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
    >
      <AuthorStoryCard
        v-for="story in stories"
        :key="story._id"
        :story="story"
        :status-colors="statusColors"
        :status-labels="statusLabels"
        :get-action-items="getActionItems"
      />
    </div>
    <div
      v-else
      class="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
    >
      <p class="text-gray-500">
        Bạn chưa có tác phẩm nào.
      </p>
      <UButton
        class="mt-4"
        color="neutral"
        @click="openStoryModal(null)"
      >
        Bắt đầu sáng tác ngay
      </UButton>
    </div>

    <UModal
      v-model:open="isModalOpen"
    >
      <template #header>
        <h2 class="text-xl font-bold">
          {{ isEditing ? 'Chỉnh sửa Tác phẩm' : 'Khởi tạo Tác phẩm' }}
        </h2>
      </template>
      <template #body>
        <div
          v-if="isFetchingDetails"
          class="text-center p-8"
        >
          Đang tải dữ liệu...
        </div>
        <UForm
          v-else
          ref="storyFormRef"
          :state="formState"
          :schema="storySchema"
          @submit="handleSubmit"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="md:col-span-1">
              <ImageUploader v-model="formState.coverImage" />
            </div>
            <div class="md:col-span-2">
              <UTabs
                :items="isEditing ? editTabs : addTabs"
                color="neutral"
              >
                <template #prompt>
                  <div class="space-y-4 pt-4">
                    <UFormField
                      label="Ý tưởng Cốt lõi (Prompt)"
                      name="prompt"
                      description="Nhập ý tưởng, sau đó nhấn 'AI Phác thảo' để tự động điền các thông tin còn lại."
                    >
                      <UTextarea
                        v-model="formState.prompt"
                        :rows="12"
                        :placeholder="promptPlaceholder"
                        class="w-full"
                      />
                    </UFormField>
                    <div class="flex justify-end">
                      <UButton
                        variant="soft"
                        icon="i-heroicons-sparkles"
                        :loading="isGenerating"
                        @click="callAIGenerate"
                      >
                        AI Phác thảo
                      </UButton>
                    </div>
                  </div>
                </template>
                <template #basic>
                  <div class="space-y-4 pt-4">
                    <UFormField
                      label="Tên Tác phẩm"
                      name="title"
                    >
                      <UInput
                        v-model="formState.title"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField
                      label="Mô tả ngắn"
                      name="description"
                    >
                      <UTextarea
                        v-model="formState.description"
                        :rows="5"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField
                      v-if="isEditing"
                      label="Trạng thái"
                      name="status"
                    >
                      <USelectMenu
                        v-model="formState.status"
                        :items="statusOptionsForSelect"
                        value-key="value"
                        class="w-full"
                      />
                    </UFormField>
                  </div>
                </template>
                <template #classification>
                  <div class="space-y-4 pt-4">
                    <UFormField
                      label="Thể loại"
                      name="genres"
                    >
                      <USelectMenu
                        v-model="formState.genres"
                        :items="genresFromAPI"
                        multiple
                        placeholder="Chọn thể loại"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField
                      label="Tags (phân cách bởi dấu phẩy)"
                      name="tags"
                    >
                      <UInput
                        v-model="formState.tags"
                        class="w-full"
                      />
                    </UFormField>
                  </div>
                </template>
                <template #advanced>
                  <div class="space-y-4 pt-4">
                    <UFormField
                      label="Ý tưởng Cốt lõi (Prompt)"
                      name="prompt"
                      description="Prompt gốc sẽ được dùng để giữ vững 'linh hồn' của truyện khi AI viết các chương sau."
                    >
                      <UTextarea
                        v-model="formState.prompt"
                        :rows="12"
                        class="w-full"
                      />
                    </UFormField>
                  </div>
                </template>
              </UTabs>
            </div>
          </div>
        </UForm>
      </template>
      <template #footer>
        <UButton
          variant="ghost"
          color="error"
          @click="isModalOpen = false"
        >
          Hủy
        </UButton>
        <UButton
          type="submit"
          :loading="isLoading"
          color="neutral"
          @click="storyFormRef?.submit()"
        >
          {{ isEditing ? 'Cập nhật Tác phẩm' : 'Khởi tạo Tác phẩm' }}
        </UButton>
      </template>
    </UModal>
  </UContainer>
</template>

<script setup lang="ts">
useHead({ title: 'Tác phẩm của tôi' })

const toast = useToast()
const storyFormRef = ref()
const { data: genresFromAPI } = await useFetch<string[]>('/api/genres', { default: () => [] })
const { data: stories, refresh: refreshStories } = await useFetch<any[]>('/api/author/stories')
console.log('Fetched stories:', stories.value)

// ----- SỬ DỤNG COMPOSABLE ĐỂ QUẢN LÝ FORM -----
const {
  formState, storySchema, isLoading, isGenerating, isFetchingDetails,
  resetForm, fetchStoryDetails, handleGenerateDetails
} = useStoryForm()

// ----- STATE & CẤU HÌNH GIAO DIỆN -----
const isModalOpen = ref(false)
const isEditing = ref(false)

const addTabs = [{ slot: 'prompt', label: 'Ý tưởng' }, { slot: 'basic', label: 'Thông tin' }, { slot: 'classification', label: 'Phân loại' }]
const editTabs = [{ slot: 'basic', label: 'Cơ bản' }, { slot: 'classification', label: 'Phân loại' }, { slot: 'advanced', label: 'Nâng cao' }]
const statusOptionsForSelect = [{ value: 'draft', label: 'Bản nháp' }, { value: 'published', label: 'Đã xuất bản' }, { value: 'on-hold', label: 'Tạm ngưng' }, { value: 'finished', label: 'Hoàn thành' }]
const statusColors: Record<string, any> = { 'draft': 'orange', 'published': 'green', 'on-hold': 'gray', 'finished': 'blue' }
const statusLabels: Record<string, string> = { 'draft': 'Bản nháp', 'published': 'Đã xuất bản', 'on-hold': 'Tạm ngưng', 'finished': 'Hoàn thành' }
const promptPlaceholder = `Ví dụ:
- **Thể loại:** Huyền huyễn, Phiêu lưu, Hài hước.

- **Nhân vật chính:** Tên là Vĩ, một thanh niên làm nghề "shipper" cổ vật, chuyên vận chuyển các món đồ kỳ lạ giữa các thành phố. Cậu ta lanh lợi, mồm mép, và có nguyên tắc sống là "không bao giờ dính vào rắc rối". Vĩ không có tài năng tu luyện nhưng lại sở hữu một khả năng đặc biệt: "May mắn vô lý", giúp cậu ta luôn thoát khỏi hiểm cảnh một cách khó tin.

- **Thế giới:** Một thế giới nơi các vị thần cổ đại đã sụp đổ, để lại những "Mảnh Vỡ Thần Lực" rải rác khắp nơi. Những mảnh vỡ này ban cho người sở hữu những năng lực dị thường nhưng cũng đi kèm với sự điên rồ hoặc tai ương. Các thế lực lớn tranh giành nhau từng mảnh vỡ để gia tăng sức mạnh.

- **Tình tiết mở đầu:** Trong một lần giao hàng, Vĩ vô tình làm vỡ món đồ mình vận chuyển - một chiếc hộp cổ. Bên trong không phải là cổ vật mà là một "Mảnh Vỡ Thần Lực" chứa đựng linh hồn của một vị thần lảm nhảm, lắm mồm tên là "Lex". Mảnh vỡ hợp nhất với Vĩ, và Lex trở thành "hệ thống" bất đắc dĩ của cậu, liên tục đưa ra những "nhiệm vụ" trời ơi đất hỡi.

- **Xung đột chính:** Chủ nhân thực sự của Mảnh Vỡ - một tổ chức sát thủ mang tên "Bóng Đêm Tĩnh Lặng" - đang truy lùng Vĩ để lấy lại món đồ. Vĩ phải chạy trốn, đồng thời học cách sử dụng sức mạnh mới của mình và đối phó với những nhiệm vụ oái oăm của Lex.

- **Mục tiêu:** Tìm cách tách Mảnh Vỡ ra khỏi người, trả lại "cục nợ" Lex về đúng chỗ của nó, và quay lại với cuộc sống shipper bình yên. Nhưng dần dần, cậu phát hiện ra âm mưu lớn hơn của Bóng Đêm Tĩnh Lặng và bị cuốn vào việc bảo vệ những người vô tội.
`

function pollForJobResult(jobId: string, timeout = 180000) { // Timeout 3 phút
  const startTime = Date.now()
  const interval = setInterval(async () => {
    if (Date.now() - startTime > timeout) {
      clearInterval(interval)
      toast.add({ title: 'Lỗi!', description: 'Yêu cầu đã quá thời gian.', color: 'error' })
      isGenerating.value = false
      return
    }

    try {
      const response = await $fetch(`/api/jobs/${jobId}`)
      if (response.status === 'completed') {
        clearInterval(interval)
        toast.add({ title: 'AI đã sáng thế thành công!', description: `Đã tạo truyện "${response.result.newStoryTitle}".`, icon: 'i-heroicons-sparkles', color: 'success' })
        isModalOpen.value = false
        await refreshStories()
        await navigateTo(`/author/stories/${response.result.newStoryId}`)
        isGenerating.value = false
      } else if (response.status === 'failed') {
        clearInterval(interval)
        toast.add({ title: 'Lỗi từ AI!', description: response.error, color: 'error' })
        isGenerating.value = false
      }
      // Nếu status vẫn là 'pending' hoặc 'processing', không làm gì cả và chờ lần hỏi thăm tiếp theo
    } catch (error) {
      clearInterval(interval)
      toast.add({ title: 'Lỗi!', description: 'Không thể kiểm tra trạng thái công việc.', color: 'error' })
      isGenerating.value = false
    }
  }, 5000) // Hỏi thăm mỗi 5 giây
}

async function callAIGenerate() {
  // `handleGenerateDetails` bây giờ sẽ trả về `jobId` hoặc `null`
  const jobId = await handleGenerateDetails()

  if (jobId) {
    // Nếu có jobId, bắt đầu quá trình hỏi thăm kết quả
    pollForJobResult(jobId)
  }
  // `isGenerating` đã được set là true bên trong `handleGenerateDetails`
}

// ----- CÁC HÀM XỬ LÝ HÀNH ĐỘNG -----
async function openStoryModal(story: any | null) {
  resetForm()
  if (story) { // Chế độ Sửa
    isEditing.value = true
    const success = await fetchStoryDetails(story._id)
    if (success) isModalOpen.value = true
  } else { // Chế độ Thêm
    isEditing.value = false
    isModalOpen.value = true
  }
}

async function handleSubmit(event: any) {
  isLoading.value = true
  try {
    const tagsArray = event.data.tags ? (event.data.tags as string).split(',').map(tag => tag.trim()).filter(Boolean) : []
    const body = { ...event.data, tags: tagsArray }

    if (isEditing.value) { // Xử lý Cập nhật
      await $fetch(`/api/stories/${formState._id}`, { method: 'PUT', body })
      toast.add({ title: 'Cập nhật tác phẩm thành công!', color: 'success' })
    } else { // Xử lý Thêm mới
      const newStory = await $fetch('/api/stories', { method: 'POST', body })
      toast.add({ title: 'Khởi tạo tác phẩm thành công!', color: 'success' })
      await navigateTo(`/author/stories/${newStory._id}`)
    }

    isModalOpen.value = false
    await refreshStories()
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'error' })
  } finally {
    isLoading.value = false
  }
}

async function handleDeleteStory(story: any) {
  if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tác phẩm "${story.title}"?`)) return
  try {
    await $fetch(`/api/stories/${story._id}`, { method: 'DELETE' })
    toast.add({ title: 'Xóa tác phẩm thành công!', color: 'error' })
    await refreshStories()
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'error' })
  }
}
function getActionItems(story) {
  return [
    [{ label: 'Quản lý chương', icon: 'i-heroicons-book-open', click: () => navigateTo(`/author/stories/${story._id}`) }],
    [{ label: 'Chỉnh sửa thông tin', icon: 'i-heroicons-pencil-square-20-solid', click: () => openStoryModal(story) }],
    [{ label: 'Xoá truyện', icon: 'i-heroicons-trash-20-solid', labelClass: 'text-red-500 dark:text-red-400', click: () => handleDeleteStory(story) }]
  ]
}
</script>
