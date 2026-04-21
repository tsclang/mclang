{
  "targets": [
    {
      "target_name": "math",
      "sources": [
        "math.c",
        "math_napi.c"
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
