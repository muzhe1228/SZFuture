<template>
  <el-dialog
    v-model="dialogVisible"
    title="批量导入许可"
    width="520px"
    :close-on-click-modal="false"
    @close="resetModal"
  >
    <div class="import-modal">
      <div class="import-steps">
        <p class="step-item">
          <span class="step-num">1.</span>
          <el-link type="primary" :underline="false" @click="handleDownloadTemplate"> 下载 许可导入模版 </el-link>
        </p>
        <p class="step-item">
          <span class="step-num">2.</span>
          按要求填写数据后导入
        </p>
      </div>
      <div class="upload-area">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :limit="1"
          accept=".xls,.xlsx"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :file-list="fileList"
          drag
        >
          <el-icon class="el-icon--upload">
            <UploadFilled />
          </el-icon>
          <div class="el-upload__text">点击上传 <em>.xls / .xlsx</em> 文件</div>
        </el-upload>
      </div>
      <div v-if="uploadedFile" class="file-display">
        <el-icon class="file-check" :size="18">
          <CircleCheckFilled />
        </el-icon>
        <span class="file-name">{{ uploadedFile }}</span>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImportSubmit" :disabled="!uploadedFile"> 导入 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { UploadFilled, CircleCheckFilled } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import type { UploadFile, UploadInstance } from 'element-plus'

  // ─── Props ──────────────────────────────────────────────────────

  interface Props {
    modelValue: boolean
  }

  const props = defineProps<Props>()

  // ─── Emits ──────────────────────────────────────────────────────

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'import', fileName: string): void
  }>()

  // ─── Reactive Data ─────────────────────────────────────────────

  const dialogVisible = ref(props.modelValue)
  const uploadRef = ref<UploadInstance>()
  const fileList = ref<UploadFile[]>([])
  const uploadedFile = ref('')

  // ─── Watch ─────────────────────────────────────────────────────

  import { watch } from 'vue'

  watch(
    () => props.modelValue,
    (newValue) => {
      dialogVisible.value = newValue
    }
  )

  watch(dialogVisible, (newValue) => {
    emit('update:modelValue', newValue)
  })

  // ─── Methods ───────────────────────────────────────────────────

  const handleDownloadTemplate = () => {
    ElMessage.info('下载许可导入模版...')
  }

  const handleFileChange = (file: UploadFile) => {
    uploadedFile.value = file.name
  }

  const handleFileRemove = () => {
    uploadedFile.value = ''
    fileList.value = []
  }

  const handleImportSubmit = () => {
    ElMessage.success(`导入文件 "${uploadedFile.value}" 处理中...`)
    emit('import', uploadedFile.value)
    emit('update:modelValue', false)
  }

  const resetModal = () => {
    uploadedFile.value = ''
    fileList.value = []
    uploadRef.value?.clearFiles()
  }
</script>

<style lang="scss" scoped>
  .import-modal {
    .import-steps {
      margin-bottom: 20px;

      .step-item {
        font-size: 14px;

        margin-bottom: 8px;
        line-height: 1.6;

        .step-num {
          font-weight: 600;
          margin-right: 4px;
        }
      }
    }

    .upload-area {
      margin-bottom: 16px;
    }

    .file-display {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background-color: #f0f9eb;
      border-radius: 4px;

      .file-check {
        color: #67c23a;
        flex-shrink: 0;
      }

      .file-name {
        font-size: 14px;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
