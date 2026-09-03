import torch

print("Загрузка оригинальной модели от авторов...")
# torch.hub сам скачает оригинальные веса (около 25 МБ) с GitHub
model = torch.hub.load("PeterLynn/RobustVideoMatting", "mobilenetv3").cpu()
model.eval()

print("Создание тестовых тензоров (размер 320x180)...")
src = torch.randn(1, 3, 180, 320)
r1i = torch.zeros(1, 1, 90, 160)
r2i = torch.zeros(1, 1, 45, 80)
r3i = torch.zeros(1, 1, 22, 40)
r4i = torch.zeros(1, 1, 11, 20)
downsample_ratio = torch.tensor([0.25])

print("Экспорт в ONNX...")
torch.onnx.export(
    model,
    (src, r1i, r2i, r3i, r4i, downsample_ratio),
    "rvm_mobilenetv3_fp32.onnx",
    input_names=['src', 'r1i', 'r2i', 'r3i', 'r4i', 'downsample_ratio'],
    output_names=['fgr', 'pha', 'r1o', 'r2o', 'r3o', 'r4o'],
    dynamic_axes={'src': {2: 'height', 3: 'width'}} # Делаем размер динамическим
)

print("Готово! Файл rvm_mobilenetv3_fp32.onnx создан. Положите его рядом с index.html")