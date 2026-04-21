{
  "targets": [
    {
      "target_name": "geometry",
      "sources": [
        "geometry.c",
        "geometry_napi.c"
      ],
      "conditions": [
        [
          "OS!='win'",
          {
            "libraries": [
              "-lm"
            ]
          }
        ]
      ]
    }
  ]
}
