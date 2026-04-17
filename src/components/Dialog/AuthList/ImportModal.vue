<template>
  <Dialog v-model="dialogVisible" title="批量导入许可" width="520px" :close-on-click-modal="false" @close="handleClose">
    <div class="import-modal">
      <div class="import-steps">
        <p class="step-item">
          <span class="step-num">1.</span>
          <el-link type="primary" :underline="false" @click="handleDownloadTemplate">
            下载 许可导入模版
          </el-link>
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
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            点击上传 <em>.xls / .xlsx</em> 文件
          </div>
        </el-upload>
      </div>
      <div v-if="uploadedFile" class="file-display">
        <el-icon class="file-check" :size="18"><CircleCheckFilled /></el-icon>
        <span class="file-name">{{ uploadedFile }}</span>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleImport" :loading="importLoading" :disabled="!uploadedFile">导入</el-button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { UploadFilled, CircleCheckFilled } from '@element-plus/icons-vue'
import { Dialog } from '@/components/Dialog'


const props = defineProps<{
  modelValue: boolean
  importLoading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'import': [file: File]
  'download-template': []
  'close': []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const uploadRef = ref<any>()
const fileList = ref<any[]>([])
const uploadedFile = ref('')
const selectedFile = ref<File | null>(null)

const handleDownloadTemplate = () => {
  emit('download-template')
}

const handleFileChange = (file: any) => {
  fileList.value = [file]
  uploadedFile.value = file.name
  selectedFile.value = file.raw
}

const handleFileRemove = () => {
  fileList.value = []
  uploadedFile.value = ''
  selectedFile.value = null
}

const handleImport = () => {
  if (selectedFile.value) {
    emit('import', selectedFile.value)
    dialogVisible.value = false
  }
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleClose = () => {
  fileList.value = []
  uploadedFile.value = ''
  selectedFile.value = null
  emit('close')
}
</script>

<style lang="scss" scoped>
.import-modal {
  padding: 20px 0;
}

.import-steps {
  margin-bottom: 24px;

  .step-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    .step-num {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      min-width: 20px;
    }
  }
}

.upload-area {
  margin-bottom: 20px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  background-color: #fafafa;
}

.file-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #f0f9eb;
  border: 1px solid #c2e7b0;
  border-radius: 4px;
  color: #67c23a;
  font-size: 14px;

  .file-check {
    flex-shrink: 0;
  }

  .file-name {
    flex: 1;
    word-break: break-all;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>