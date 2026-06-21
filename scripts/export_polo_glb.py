import bpy

output_path = r"E:\Workspace\Project\CodingHCM1App\public\models\polo_black_with_logo.glb"

bpy.ops.object.select_all(action="DESELECT")
for obj in bpy.context.scene.objects:
    if obj.type == "MESH":
        obj.hide_render = False
        obj.hide_set(False)
        obj.select_set(True)

bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_materials="EXPORT",
    export_normals=True,
    export_texcoords=True,
    export_yup=True,
)

print("EXPORTED", output_path)
