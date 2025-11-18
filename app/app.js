import { Application, StackLayout, ScrollView, Label, Page } from "@nativescript/core";

// Android izinleri
const PermissionImages = android.Manifest.permission.READ_MEDIA_IMAGES;
const PermissionVideo = android.Manifest.permission.READ_MEDIA_VIDEO;
const PermissionStorage = android.Manifest.permission.READ_EXTERNAL_STORAGE;

Application.on(Application.launchEvent, async () => {
    const activity = Application.android.startActivity;

    // Android 10 öncesi için storage izni
    const needStorage = android.os.Build.VERSION.SDK_INT < 33;
    const perms = needStorage ? [PermissionStorage] : [PermissionImages, PermissionVideo];

    // İzinleri sor
    await requestPermissions(activity, perms);

    // Sayfa oluştur
    const page = new Page();
    const scroll = new ScrollView();
    const layout = new StackLayout();
    scroll.content = layout;
    page.content = scroll;

    // Fotoğrafları ve videoları al
    const images = getImages(activity);
    const videos = getVideos(activity);

    // Başlıklar
    layout.addChild(new Label({ text: "📷 FOTOĞRAFLAR", className: "header" }));
    images.forEach(p => layout.addChild(new Label({ text: p })));

    layout.addChild(new Label({ text: "🎬 VİDEOLAR", className: "header" }));
    videos.forEach(p => layout.addChild(new Label({ text: p })));

    Application.run({ create: () => page });
});

// İzin isteyen fonksiyon
function requestPermissions(activity, permissions) {
    return new Promise((resolve) => {
        androidx.core.app.ActivityCompat.requestPermissions(
            activity,
            permissions,
            123
        );

        Application.android.on(
            Application.android.onRequestPermissionsResultEvent,
            () => resolve(true)
        );
    });
}

// Fotoğraf listesi alma
function getImages(activity) {
    const list = [];
    const uri = android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
    const proj = [android.provider.MediaStore.Images.Media.DATA];
    const cursor = activity.getContentResolver().query(uri, proj, null, null, null);
    if (cursor) {
        const idx = cursor.getColumnIndexOrThrow(android.provider.MediaStore.Images.Media.DATA);
        while (cursor.moveToNext()) list.push(cursor.getString(idx));
        cursor.close();
    }
    return list;
}

// Video listesi alma
function getVideos(activity) {
    const list = [];
    const uri = android.provider.MediaStore.Video.Media.EXTERNAL_CONTENT_URI;
    const proj = [android.provider.MediaStore.Video.Media.DATA];
    const cursor = activity.getContentResolver().query(uri, proj, null, null, null);
    if (cursor) {
        const idx = cursor.getColumnIndexOrThrow(android.provider.MediaStore.Video.Media.DATA);
        while (cursor.moveToNext()) list.push(cursor.getString(idx));
        cursor.close();
    }
    return list;
}